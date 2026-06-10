import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Mail, Phone, CalendarClock } from 'lucide-react';
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

const AdminLeads: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSlugFilter, setPageSlugFilter] = useState('all');

  const fetchPages = async () => {
    const res = await api.get('/pages');
    setPages(res.data || []);
  };

  const fetchLeads = async (pageSlug?: string) => {
    const params = pageSlug && pageSlug !== 'all' ? { pageSlug } : undefined;
    const res = await api.get('/leads', { params });
    setLeads(res.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchPages(), fetchLeads()]);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchLeads(pageSlugFilter);
      } catch (err) {
        console.error(err);
        alert('Failed to filter leads');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [pageSlugFilter]);

  const selectedPageName = useMemo(() => {
    if (pageSlugFilter === 'all') return 'All Pages';
    const page = pages.find((p) => p.slug === pageSlugFilter);
    return page?.pageName || pageSlugFilter;
  }, [pageSlugFilter, pages]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-mahindra-red font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing leads for</p>
            <p className="text-xl font-bold text-gray-900">{selectedPageName}</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={pageSlugFilter}
              onChange={(e) => setPageSlugFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-mahindra-red"
            >
              <option value="all">All Pages</option>
              {pages.map((p) => (
                <option key={p._id} value={p.slug}>
                  {p.pageName} ({p.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-gray-500">No leads found for this page.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Message / Fields</th>
                    <th className="px-4 py-3 font-semibold">Source Page</th>
                    <th className="px-4 py-3 font-semibold">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-semibold text-gray-900">{lead.name || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-700"><Mail className="w-3.5 h-3.5" /> {lead.email || '-'}</div>
                        <div className="flex items-center gap-1 text-gray-700 mt-1"><Phone className="w-3.5 h-3.5" /> {lead.phone || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div>{lead.message || lead.needs || '-'}</div>
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(lead)
                            .filter(([k]) => !['_id', 'name', 'email', 'phone', 'message', 'needs', 'sourcePageName', 'sourcePageSlug', 'sourcePath', 'createdAt', 'updatedAt', '__v'].includes(k))
                            .slice(0, 6)
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(' | ') || 'No extra fields'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium">{lead.sourcePageName || '-'}</div>
                        <div className="text-xs text-gray-500">/{lead.sourcePageSlug || '-'}</div>
                        <div className="text-xs text-gray-500 break-all">{lead.sourcePath || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLeads;
