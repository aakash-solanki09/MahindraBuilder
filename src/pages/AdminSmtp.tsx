import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MailCheck, Save, Send } from 'lucide-react';
import api from '../lib/api';

type SmtpForm = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

const AdminSmtp: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SmtpForm>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromName: 'Mahindra Logistics',
    fromEmail: '',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/smtp');
      if (res.data) {
        setForm((prev) => ({
          ...prev,
          host: res.data.host || '',
          port: res.data.port || 587,
          secure: !!res.data.secure,
          user: res.data.user || '',
          password: '',
          fromName: res.data.fromName || 'Mahindra Logistics',
          fromEmail: res.data.fromEmail || '',
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/smtp', form);
      alert('SMTP settings saved successfully');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    setTesting(true);
    try {
      await api.post('/smtp/test');
      alert('Test email sent successfully');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'SMTP test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-mahindra-red font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-mahindra-red" />
            SMTP Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={onSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Email Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Host</label>
              <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Port</label>
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP User</label>
              <input value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Keep empty to retain existing password" className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">From Name</label>
              <input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">From Email</label>
              <input type="email" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-mahindra-red" required />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.checked })} className="w-4 h-4 text-mahindra-red rounded border-gray-300" />
            Use SSL/TLS (secure)
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="h-11 px-5 rounded-xl bg-mahindra-red text-white font-semibold inline-flex items-center gap-2 hover:bg-red-700 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save SMTP'}
            </button>
            <button type="button" disabled={testing} onClick={onTest} className="h-11 px-5 rounded-xl border border-mahindra-red text-mahindra-red bg-white font-semibold inline-flex items-center gap-2 hover:bg-red-50 disabled:opacity-60">
              <Send className="w-4 h-4" />
              {testing ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminSmtp;
