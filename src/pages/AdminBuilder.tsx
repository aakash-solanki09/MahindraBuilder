import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../store/useBuilderStore';
import api from '../lib/api';
import Sidebar from '../components/builder/Sidebar';
import Toolbar from '../components/builder/Toolbar';
import Canvas from '../components/builder/Canvas';
import SEO from "../components/SEO";

const AdminBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const page = useBuilderStore((state) => state.page);
  const selectedSectionId = useBuilderStore((state) => state.selectedSectionId);
  const setSelectedSection = useBuilderStore((state) => state.setSelectedSection);
  const reorderSections = useBuilderStore((state) => state.reorderSections);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);

  const [activeTab, setActiveTab] = React.useState<'add' | 'edit' | 'custom' | 'settings'>('add');
  const [showStylePanel, setShowStylePanel] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeColorPicker, setActiveColorPicker] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);

  // Handle auto-closing sidebar on smaller screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts for Undo/Redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const res = await api.get(`/pages/${id}`);
          if (res.data) useBuilderStore.getState().setPage(res.data);
        } else {
          // Fallback to preview home page if no ID provided
          const res = await api.get('/pages/slug/preview');
          if (res.data) useBuilderStore.getState().setPage(res.data);
        }
        await useBuilderStore.getState().fetchCustomTemplates();
      } catch (err) {
        console.warn('Page or templates not found');
      }
    };
    fetchData();
  }, [id]);

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = page.sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (page.sections[index]?.type === 'thank-you') return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === page.sections.length - 1) return;

    const newSections = [...page.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (newSections[targetIndex]?.type === 'thank-you') return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    reorderSections(newSections);
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      const payload = {
        ...page,
        published: publish,
        publishedAt: publish ? (page.publishedAt || new Date()) : page.publishedAt,
        id: id || page._id
      };
      const res = await api.post('/pages', payload);
      useBuilderStore.getState().setPage(res.data);
      alert(publish ? 'Page Published Successfully!' : 'Draft Saved Successfully!');
      
      // If we just created a page without an ID in the URL, redirect to the new ID
      if (!id && res.data._id) {
        navigate(`/admin/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert('Error saving page');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-gray-100 font-sans relative">
      <SEO pageName={page.pageName} slug={page.slug} meta={page.meta} />
      {/* Sidebar Overlay/Backdrop for Mobile */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showStylePanel={showStylePanel}
        setShowStylePanel={setShowStylePanel}
        isSaving={isSaving}
        handleSave={handleSave}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <Toolbar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Canvas 
          moveSection={moveSection}
          setShowStylePanel={(show) => {
            setShowStylePanel(show);
            if (show) setActiveTab('edit');
          }}
        />
      </main>
    </div>
  );
};

export default AdminBuilder;
