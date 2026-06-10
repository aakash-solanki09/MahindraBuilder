import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../store/useBuilderStore';
import { ChevronRight, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Layout, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

interface ToolbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const { view, setView, undo, redo, past, future, page } = useBuilderStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  };

  const openDraftPreview = () => {
    const draftPageId = page._id || page.slug || 'preview';
    const draftKey = `builder-preview-page:${draftPageId}`;
    const draftVersion = Date.now();

    localStorage.setItem(draftKey, JSON.stringify(page));
    // Backward-compatible fallback key
    localStorage.setItem('builder-preview-page', JSON.stringify(page));

    window.open(
      `/preview?mode=draft&draftKey=${encodeURIComponent(draftKey)}&v=${draftVersion}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="bg-white border-b p-2 lg:p-3 flex justify-between items-center px-4 lg:px-8 shadow-sm z-40 gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-mahindra-blue"
          title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        >
          <ChevronRight className={cn("w-5 h-5 transition-transform", isSidebarOpen && "rotate-180")} />
        </button>
        <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className={cn("p-2 rounded-lg transition-all", past.length > 0 ? "text-gray-600 hover:bg-white hover:text-mahindra-red" : "text-gray-300 cursor-not-allowed")}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className={cn("p-2 rounded-lg transition-all", future.length > 0 ? "text-gray-600 hover:bg-white hover:text-mahindra-red" : "text-gray-300 cursor-not-allowed")}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive View Toggles */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
        {[
          { id: 'desktop', icon: Monitor },
          { id: 'tablet', icon: Tablet },
          { id: 'mobile', icon: Smartphone },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={cn(
              "p-2.5 rounded-xl transition-all flex items-center gap-2",
              view === item.id ? "bg-white text-mahindra-red shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">{item.id}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            fontSize: '10px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#4b5563';
          }}
        >
          <LogOut className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span className="hidden sm:inline">Logout</span>
        </button>
        <a 
          href="/admin/dashboard" 
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-mahindra-red hover:bg-red-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-gray-100"
        >
          <Layout className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </a>
        <button
          onClick={openDraftPreview}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-mahindra-red transition-all text-xs font-bold uppercase tracking-widest"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Logout</h2>
            <p className="text-gray-600 mb-8">Are you sure you want to logout? You'll need to login again to access the admin panel.</p>
            
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
    </div>
  );
};

export default Toolbar;
