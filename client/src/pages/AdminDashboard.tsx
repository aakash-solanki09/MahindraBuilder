import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Globe, 
  FileText,
  Clock,
  Layout,
  LogOut,
  Mail,
  Phone,
  Eye,
  Filter,
  Calendar,
  Inbox
} from 'lucide-react';
import api from '../lib/api';
import type { PageData } from '../types';

type LeadItem = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  sourcePageName?: string;
  sourcePageSlug?: string;
  sourcePath?: string;
  createdAt?: string;
  [key: string]: any;
};

const AdminDashboard: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPageData, setNewPageData] = useState({ name: '', slug: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Tab and Inquiries state
  const [activeTab, setActiveTab] = useState<'pages' | 'inquiries'>('pages');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadPageFilter, setLeadPageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedInquiry, setSelectedInquiry] = useState<LeadItem | null>(null);

  useEffect(() => {
    fetchPages();
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data || []);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [leadPageFilter, leadSearchQuery, rowsPerPage]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const leadSlug = (lead.sourcePageSlug || '').toLowerCase().trim();
      const leadName = (lead.sourcePageName || '').toLowerCase().trim();
      const hasSource = leadSlug !== '' && leadSlug !== 'preview' && leadSlug !== 'mahindralogistic';

      // 1. Landing Page filter
      if (leadPageFilter !== 'all') {
        if (leadPageFilter === '__unattributed__') {
          // Show only unattributed leads (no slug, or legacy 'preview' slug)
          if (hasSource) return false;
        } else {
          // Show leads matching the selected page slug
          // Also show unattributed leads here so admin can see and re-attribute them
          const matchesSlug = leadSlug === leadPageFilter.toLowerCase();
          const matchesName = leadName === leadPageFilter.toLowerCase();
          if (!matchesSlug && !matchesName && hasSource) return false;
          // Fully unattributed leads are hidden when specific page is selected
          if (!matchesSlug && !matchesName && !hasSource) return false;
        }
      }

      // 2. Search query filter
      if (leadSearchQuery.trim()) {
        const query = leadSearchQuery.toLowerCase();
        const nameMatch = lead.name?.toLowerCase().includes(query) || false;
        const emailMatch = lead.email?.toLowerCase().includes(query) || false;
        const phoneMatch = lead.phone?.toLowerCase().includes(query) || false;
        const messageMatch = lead.message?.toLowerCase().includes(query) || 
                             lead.needs?.toLowerCase().includes(query) || false;
        
        // Check extra custom fields
        const extraFieldsMatch = Object.entries(lead).some(([key, val]) => {
          if (['_id', 'name', 'email', 'phone', 'message', 'needs', 'sourcePageName', 'sourcePageSlug', 'sourcePath', 'createdAt', 'updatedAt', '__v', 'pageId'].includes(key)) {
            return false;
          }
          return String(val).toLowerCase().includes(query);
        });

        if (!nameMatch && !emailMatch && !phoneMatch && !messageMatch && !extraFieldsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [leads, leadPageFilter, leadSearchQuery]);

  // Count of unattributed leads
  const unattributedCount = useMemo(() => {
    return leads.filter(lead => {
      const slug = (lead.sourcePageSlug || '').toLowerCase().trim();
      return slug === '' || slug === 'preview' || slug === 'mahindralogistic';
    }).length;
  }, [leads]);


  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / rowsPerPage));

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pages');
      setPages(res.data);
    } catch (err) {
      console.error('Failed to fetch pages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageData.name || !newPageData.slug) return;
    
    setIsCreating(true);
    try {
      const normalizedSlug = newPageData.slug.toLowerCase().replace(/\s+/g, '-');
      const pageTitle = newPageData.name.trim();
      const payload = {
        pageName: newPageData.name,
        slug: normalizedSlug,
        meta: {
          title: pageTitle,
          description: `Learn more about ${pageTitle}.`,
          attributes: [],
          links: []
        },
        sections: [],
        published: false
      };
      const res = await api.post('/pages', payload);
      navigate(`/admin/builder/${res.data._id}`);
    } catch (err) {
      console.error('Failed to create page', err);
      alert('Error creating page. Slug might already be in use.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.delete(`/pages/${id}`);
      setPages(pages.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete page', err);
      alert('Error deleting page');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  };

  const filteredPages = pages.filter(p => 
    p.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-mahindra-red rounded-lg flex items-center justify-center shadow-lg shadow-red-100">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mahindra Builder</h1>
            </a>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  padding: '0.625rem 1rem',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <LogOut className="w-4 h-4" style={{ flexShrink: 0 }} />
                <span>Logout</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-mahindra-red hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Page</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-4 text-base sm:text-lg font-bold transition-all relative ${
              activeTab === 'pages' ? 'text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Landing Pages ({pages.length})
            {activeTab === 'pages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-mahindra-red rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-4 text-base sm:text-lg font-bold transition-all relative ${
              activeTab === 'inquiries' ? 'text-mahindra-red' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            User Inquiries ({leads.length})
            {activeTab === 'inquiries' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-mahindra-red rounded-full" />
            )}
          </button>
        </div>

        {activeTab === 'pages' ? (
          <>
            {/* Stats & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Your Landing Pages</h2>
                <p className="text-gray-500 mt-1">Manage and optimize your logistics marketing pages.</p>
              </div>
              
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3 border-none ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white bg-gray-100/50 transition-all outline-none"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-64"></div>
                ))}
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No pages found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  {searchQuery ? "No pages match your search criteria." : "Get started by creating your first landing page."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 text-mahindra-red font-bold hover:underline inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create your first page
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPages.map((page) => (
                  <div 
                    key={page._id}
                    className="group bg-white rounded-3xl border border-gray-200 hover:border-mahindra-red/30 transition-all hover:shadow-2xl hover:shadow-gray-200/50 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          page.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {page.published ? 'Published' : 'Draft'}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeletePage(page._id!)}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2">
                        {page.pageName}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">/{page.slug}</span>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(page.updatedAt || '').toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{page.sections.length} Sections</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/50 flex gap-2">
                      <button 
                        onClick={() => navigate(`/admin/builder/${page._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-200 py-2.5 rounded-xl font-bold transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <a 
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 flex items-center justify-center bg-white hover:bg-mahindra-red hover:text-white text-gray-400 border border-gray-200 rounded-xl transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Stats & Search for Inquiries */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Inquiries</h2>
                  <p className="text-gray-500 mt-1 text-sm">Manage and track form submissions across all your landing pages.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-[200px] sm:flex-initial sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-2 text-sm border-none ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white bg-gray-50 transition-all outline-none"
                      placeholder="Search inquiries..."
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Landing Page Filter */}
                  <div className="relative flex-1 min-w-[150px] sm:flex-initial">
                    <select
                      value={leadPageFilter}
                      onChange={(e) => setLeadPageFilter(e.target.value)}
                      className="block w-full py-2 pl-3 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="all">All Pages</option>
                      {pages.map((p) => (
                        <option key={p._id} value={p.slug}>
                          {p.pageName} (/{p.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rows Per Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Rows:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="block py-2 pl-2 pr-6 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      {[5, 10, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {leadsLoading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm animate-pulse">
                <p className="text-gray-500 font-medium">Loading inquiries...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Inbox className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No inquiries found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  {leadSearchQuery || leadPageFilter !== 'all' 
                    ? "No inquiries match your current search or filter criteria." 
                    : "No submissions have been received yet."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50/70 border-b border-gray-150 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Remarks / Message</th>
                        <th className="px-6 py-4">Source Page</th>
                        <th className="px-6 py-4">Submitted At</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedLeads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors align-top">
                          <td className="px-6 py-4 font-bold text-gray-950">{lead.name || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`mailto:${lead.email}`} className="hover:underline hover:text-mahindra-red break-all">{lead.email || '-'}</a>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1.5 text-gray-700 mt-1">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700 max-w-[280px]">
                            <p className="line-clamp-2">{lead.message || lead.needs || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-mahindra-red border border-red-100">
                              {lead.sourcePageName || lead.sourcePageSlug || 'preview'}
                            </span>
                            <span className="block text-[10px] text-gray-400 mt-1 font-mono">/{lead.sourcePageSlug || 'preview'}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedInquiry(lead)}
                              className="inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-750 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold transition-all shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-gray-50/30 border-t border-gray-150">
                  <div className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                    <span className="font-semibold text-gray-800">
                      {Math.min(currentPage * rowsPerPage, filteredLeads.length)}
                    </span>{' '}
                    of <span className="font-semibold text-gray-800">{filteredLeads.length}</span> inquiries
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        First
                      </button>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        Prev
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="text-gray-400 px-1 text-xs">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all text-xs ${
                                  currentPage === page
                                    ? 'bg-mahindra-red text-white shadow-sm'
                                    : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        Next
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Logout</h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to logout? You'll need to login again to access the admin panel.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-mahindra-red text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Landing Page</h2>
            <p className="text-gray-500 mb-6">Enter a name and unique URL slug for your new page.</p>
            
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Page Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Warehouse Solutions"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white outline-none transition-all"
                  value={newPageData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    setNewPageData({ name, slug });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-4 inset-y-0 flex items-center text-gray-400 font-medium">/</span>
                  <input
                    type="text"
                    required
                    placeholder="preview"
                    className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white outline-none transition-all"
                    value={newPageData.slug}
                    onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 px-1 italic">Note: Use 'preview' for your main home page.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-mahindra-red text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Inquiry Details</h3>
                <p className="text-sm text-gray-500 mt-1">Submitted on {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              {/* Primary Fields */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                  <p className="text-base font-bold text-gray-900">{selectedInquiry.name || '-'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-bold text-mahindra-red hover:underline break-all">{selectedInquiry.email || '-'}</a>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                    <a href={`tel:${selectedInquiry.phone}`} className="text-sm font-bold text-gray-900 hover:underline">{selectedInquiry.phone || '-'}</a>
                  </div>
                </div>
              </div>

              {/* Source Page info */}
              <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Source Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Landing Page</span>
                    <span className="font-semibold text-gray-800">{selectedInquiry.sourcePageName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">URL Slug</span>
                    <span className="font-semibold text-gray-800">/{selectedInquiry.sourcePageSlug || '-'}</span>
                  </div>
                </div>
                <div className="text-sm pt-2 border-t border-gray-50">
                  <span className="text-gray-500 block text-xs">Submission Path</span>
                  <span className="font-mono text-xs text-gray-600 break-all">{selectedInquiry.sourcePath || '-'}</span>
                </div>
              </div>

              {/* Message / Remarks */}
              {(selectedInquiry.message || selectedInquiry.needs) && (
                <div className="bg-red-50/30 border border-red-100 rounded-2xl p-5">
                  <label className="block text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Message / Remarks</label>
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{selectedInquiry.message || selectedInquiry.needs}</p>
                </div>
              )}

              {/* Extra Form Fields */}
              {Object.entries(selectedInquiry)
                .filter(([k]) => !['_id', 'name', 'email', 'phone', 'message', 'needs', 'sourcePageName', 'sourcePageSlug', 'sourcePath', 'createdAt', 'updatedAt', '__v'].includes(k))
                .length > 0 && (
                  <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Form Data</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(selectedInquiry)
                        .filter(([k]) => !['_id', 'name', 'email', 'phone', 'message', 'needs', 'sourcePageName', 'sourcePageSlug', 'sourcePath', 'createdAt', 'updatedAt', '__v'].includes(k))
                        .map(([key, val]) => (
                          <div key={key}>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{key}</label>
                            <p className="text-sm font-semibold text-gray-800">{String(val)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
