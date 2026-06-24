import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  LogOut,
  ArrowLeft,
  Globe,
  MousePointerClick,
  Tag,
  Calendar,
  Filter,
  Search,
  Inbox,
  ExternalLink,
  Clock,
  BarChart3,
} from 'lucide-react';
import api from '../lib/api';
import type { PageData } from '../types';
import { resolveMediaUrl } from '../lib/media';

type UTMItem = {
  _id: string;
  pageId?: string;
  pageName?: string;
  pageSlug?: string;
  sourcePath?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_id?: string;
  utm_term?: string;
  utm_content?: string;
  fullUrl?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  createdAt?: string;
};

const AdminUtmAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // Get active brand details
  const userRaw = localStorage.getItem('user');
  let brandName = 'Mahindra Logistics';
  let brandLogo = '/assets/images/86.png';
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);
      if (user.brandName !== undefined) brandName = user.brandName;
      if (user.brandLogo !== undefined) brandLogo = user.brandLogo;
    } catch (e) {
      console.error(e);
    }
  }

  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('all');
  const [utmData, setUtmData] = useState<UTMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [utmLoading, setUtmLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedSlug !== 'all') {
      fetchUtmByPage(selectedSlug);
    } else {
      fetchAllUtm();
    }
    setCurrentPage(1);
    setSearchQuery('');
  }, [selectedSlug]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pages');
      setPages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pages', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUtm = async () => {
    try {
      setUtmLoading(true);
      const res = await api.get('/utm');
      setUtmData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch UTM data', err);
      setUtmData([]);
    } finally {
      setUtmLoading(false);
    }
  };

  const fetchUtmByPage = async (slug: string) => {
    try {
      setUtmLoading(true);
      const res = await api.get(`/utm/page/${slug}`);
      setUtmData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch UTM data for page', err);
      setUtmData([]);
    } finally {
      setUtmLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return utmData;
    const q = searchQuery.toLowerCase();
    return utmData.filter(
      (item) =>
        (item.utm_source || '').toLowerCase().includes(q) ||
        (item.utm_medium || '').toLowerCase().includes(q) ||
        (item.utm_campaign || '').toLowerCase().includes(q) ||
        (item.utm_content || '').toLowerCase().includes(q) ||
        (item.utm_term || '').toLowerCase().includes(q) ||
        (item.fullUrl || '').toLowerCase().includes(q)
    );
  }, [utmData, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const stats = useMemo(() => {
    const totalHits = filteredData.length;
    const uniqueSources = new Set(filteredData.map((d) => d.utm_source).filter(Boolean)).size;
    const uniqueCampaigns = new Set(filteredData.map((d) => d.utm_campaign).filter(Boolean)).size;
    const uniqueMediums = new Set(filteredData.map((d) => d.utm_medium).filter(Boolean)).size;
    return { totalHits, uniqueSources, uniqueCampaigns, uniqueMediums };
  }, [filteredData]);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <a href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {brandLogo && (
                  <div className="h-10 w-auto flex items-center justify-center overflow-hidden">
                    <img src={resolveMediaUrl(brandLogo)} alt={brandName || "Logo"} className="h-10 w-auto object-contain max-h-10" />
                  </div>
                )}
                {brandName && (
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">{brandName}</h1>
                )}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-full">
                UTM Analytics
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-full font-semibold transition-all hover:bg-gray-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Selector + Search */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">UTM Campaign Analytics</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Track marketing campaign performance across your landing pages.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px] sm:flex-initial sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 text-sm border-none ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white bg-gray-50 transition-all outline-none"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="relative flex-1 min-w-[180px] sm:flex-initial">
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="block w-full py-2 pl-3 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mahindra-red focus:bg-white outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="all">All Pages</option>
                  {pages.map((p) => (
                    <option key={p._id} value={p.slug}>
                      {p.pageName} (/{p.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Clicks', value: stats.totalHits, icon: MousePointerClick, color: 'bg-red-50 text-mahindra-red' },
            { label: 'Unique Sources', value: stats.uniqueSources, icon: Globe, color: 'bg-blue-50 text-blue-600' },
            { label: 'Campaigns', value: stats.uniqueCampaigns, icon: Tag, color: 'bg-purple-50 text-purple-600' },
            { label: 'Mediums', value: stats.uniqueMediums, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Data Table */}
        {utmLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm animate-pulse">
            <p className="text-gray-500 font-medium">Loading UTM data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No UTM data found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              {searchQuery || selectedSlug !== 'all'
                ? 'No records match your current filter. Try selecting a different page.'
                : 'UTM data will appear here once visitors arrive via campaign links.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50/70 border-b border-gray-150 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Medium</th>
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Content / Term</th>
                    <th className="px-6 py-4">Page</th>
                    <th className="px-6 py-4">Visited At</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors align-top">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-mahindra-red border border-red-100">
                          {item.utm_source || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          {item.utm_medium || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 max-w-[200px] truncate">
                        {item.utm_campaign || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-[180px]">
                        <p className="truncate">{item.utm_content || '-'}</p>
                        {item.utm_term && (
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">term: {item.utm_term}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-700">{item.pageName || '-'}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">/{item.pageSlug || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.fullUrl ? (
                          <a
                            href={item.fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-750 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold transition-all shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Visit
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-gray-50/30 border-t border-gray-150">
              <div className="text-xs text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-800">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * rowsPerPage, filteredData.length)}
                </span>{' '}
                of <span className="font-semibold text-gray-800">{filteredData.length}</span> records
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
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent font-bold transition-all text-[11px] uppercase tracking-wider"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="text-gray-400 px-1 text-xs">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all text-xs ${
                              currentPage === p
                                ? 'bg-mahindra-red text-white shadow-sm'
                                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
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
      </main>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Logout</h2>
            <p className="text-gray-600 mb-8">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-mahindra-red text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUtmAnalytics;
