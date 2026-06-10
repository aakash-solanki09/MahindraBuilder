import { create } from 'zustand';
import type { PageData, Section, SectionType, HtmlElementType, HtmlElement } from '../types';
import api from '../lib/api';
import { defaultSections } from '../constants/defaultData';

const ensureThankYouSection = (page: PageData): PageData => {
  const hasHero = page.sections.some((section) => section.type === 'hero');
  const nonThankYouSections = page.sections.filter((section) => section.type !== 'thank-you');

  // Only keep thank-you when hero exists, and always place it as the last section.
  const nextSections = hasHero
    ? [
        ...nonThankYouSections,
        page.sections.find((section) => section.type === 'thank-you') || {
          id: `thank-you-${Date.now().toString(36)}`,
          type: 'thank-you',
          order: nonThankYouSections.length,
          content: { ...defaultSections['thank-you'] },
          styles: {
            backgroundColor: '#F7F8FA',
            textColor: '#111827',
            headingColor: '#0A2A57',
            primaryColor: '#E31837',
            borderColor: '#d1d5db'
          }
        }
      ]
    : nonThankYouSections;

  return {
    ...page,
    sections: nextSections.map((section, index) => ({
      ...section,
      order: index,
    })),
  };
};

interface BuilderState {
  page: PageData;
  past: PageData[];
  future: PageData[];
  customTemplates: any[];
  selectedSectionId: string | null;
  selectedHtmlElementId: string | null;
  mode: 'edit' | 'preview';
  view: 'desktop' | 'tablet' | 'mobile';
  isWorkshopMode: boolean;
  workshopSection: any | null;
  workshopPast: any[];
  workshopFuture: any[];
  
  isHtmlWorkshopMode: boolean;
  htmlWorkshopSection: any | null;
  htmlWorkshopTemplateId: string | null;
  htmlWorkshopTemplateName: string | null;
  htmlWorkshopSourceSectionId: string | null;
  
  // Actions
  setPage: (page: PageData) => void;
  undo: () => void;
  redo: () => void;
  undoWorkshop: () => void;
  redoWorkshop: () => void;
  updateWorkshopSection: (updates: any) => void;
  fetchCustomTemplates: () => Promise<void>;
  saveCustomTemplate: (section: any, name: string, id?: string | null, type?: string) => Promise<void>;
  removeCustomTemplate: (id: string) => Promise<void>;
  setWorkshopMode: (active: boolean) => void;
  setHtmlWorkshopMode: (active: boolean) => void;
  resetHtmlWorkshop: () => void;
  loadHtmlDesign: (template: any, sourceSectionId?: string) => void;
  setSelectedSection: (id: string | null) => void;
  setSelectedHtmlElement: (id: string | null) => void;
  setMode: (mode: 'edit' | 'preview') => void;
  setView: (view: 'desktop' | 'tablet' | 'mobile') => void;
  
  updateSection: (id: string, updates: Partial<Section>) => void;
  updateSectionContent: (id: string, content: any) => void;
  updateSectionStyles: (id: string, styles: any) => void;
  addSection: (type: SectionType, content?: any, styles?: any) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: Section[]) => void;
  loadLogisticsTemplate: () => void;
  addHtmlElement: (sectionId: string, parentId: string, type: HtmlElementType) => void;
  updateHtmlElement: (sectionId: string, elementId: string, updates: Partial<HtmlElement>) => void;
  removeHtmlElement: (sectionId: string, elementId: string) => void;
  addWorkshopHtmlElement: (parentId: string, type: HtmlElementType) => void;
  updateWorkshopHtmlElement: (elementId: string, updates: Partial<HtmlElement>) => void;
  removeWorkshopHtmlElement: (elementId: string) => void;
}


export const useBuilderStore = create<BuilderState>((set, get) => ({
  page: {
    pageName: 'Mahindra Logistics',
    slug: 'preview',
    published: false,
    meta: {
      title: 'Mahindra Logistics',
      description: 'Logistics solutions',
      floatingCta: {
        text: 'Get Free Quote',
        backgroundColor: '#E31837',
        textColor: '#ffffff',
        borderColor: ''
      },
      attributes: [],
      links: []
    },
    sections: []
  },
  past: [],
  future: [],
  customTemplates: [],
  selectedSectionId: null,
  selectedHtmlElementId: null,
  mode: 'edit',
  view: 'desktop',
  isWorkshopMode: false,
  workshopSection: null,
  workshopPast: [],
  workshopFuture: [],
  
  isHtmlWorkshopMode: false,
  htmlWorkshopSection: null,
  htmlWorkshopTemplateId: null,
  htmlWorkshopTemplateName: null,
  htmlWorkshopSourceSectionId: null,

  setPage: (page) => set({ page: ensureThankYouSection(page) }),

  updateWorkshopSection: (updates) => {
    const { workshopSection, workshopPast } = get();
    
    // Allow initial state setting if section is null
    if (!workshopSection) {
      set({ workshopSection: updates, workshopPast: [], workshopFuture: [] });
      return;
    }

    set({
      workshopPast: [...workshopPast, JSON.parse(JSON.stringify(workshopSection))],
      workshopSection: { ...workshopSection, ...updates },
      workshopFuture: []
    });
  },

  undoWorkshop: () => {
    const { workshopPast, workshopSection, workshopFuture } = get();
    if (workshopPast.length === 0) return;

    const previous = workshopPast[workshopPast.length - 1];
    const newPast = workshopPast.slice(0, workshopPast.length - 1);

    set({
      workshopPast: newPast,
      workshopSection: previous,
      workshopFuture: [JSON.parse(JSON.stringify(workshopSection)), ...workshopFuture]
    });
  },

  redoWorkshop: () => {
    const { workshopPast, workshopSection, workshopFuture } = get();
    if (workshopFuture.length === 0) return;

    const next = workshopFuture[0];
    const newFuture = workshopFuture.slice(1);

    set({
      workshopPast: [...workshopPast, JSON.parse(JSON.stringify(workshopSection))],
      workshopSection: next,
      workshopFuture: newFuture
    });
  },

  fetchCustomTemplates: async () => {
    try {
      const res = await api.get('/custom-sections');
      set({ customTemplates: res.data });
    } catch (err) {
      console.error('Failed to fetch custom sections:', err);
    }
  },

  saveCustomTemplate: async (section: any, name: string, id?: string | null, type: string = 'custom') => {
    try {
      const { htmlWorkshopSourceSectionId, updateSectionContent, updateSectionStyles } = get();
      
      const payload = {
        name,
        type,
        content: section.content,
        styles: section.styles
      };

      // If we're editing a section already on the page, update it there too
      if (htmlWorkshopSourceSectionId) {
        updateSectionContent(htmlWorkshopSourceSectionId, section.content);
        updateSectionStyles(htmlWorkshopSourceSectionId, section.styles);
      }

      if (id) {
        const res = await api.put(`/custom-sections/${id}`, payload);
        set((state) => ({
          customTemplates: state.customTemplates.map(t => t._id === id ? res.data : t),
          isWorkshopMode: false,
          isHtmlWorkshopMode: false,
          htmlWorkshopTemplateId: null,
          htmlWorkshopTemplateName: null
        }));
      } else {
        const res = await api.post('/custom-sections', payload);
        set((state) => ({ 
          customTemplates: [res.data, ...state.customTemplates],
          isWorkshopMode: false,
          isHtmlWorkshopMode: false,
          htmlWorkshopTemplateId: null,
          htmlWorkshopTemplateName: null
        }));
      }
    } catch (err) {
      console.error('Failed to save custom section:', err);
    }
  },

  removeCustomTemplate: async (id) => {
    try {
      await api.delete(`/custom-sections/${id}`);
      set((state) => ({ 
        customTemplates: state.customTemplates.filter(t => t._id !== id) 
      }));
    } catch (err) {
      console.error('Failed to delete custom section:', err);
    }
  },

  setWorkshopMode: (active) => set({ isWorkshopMode: active }),
  setHtmlWorkshopMode: (active) => set({ isHtmlWorkshopMode: active }),
  
  resetHtmlWorkshop: () => set({ 
    htmlWorkshopSection: {
      type: 'html-builder',
      content: {
        elements: [
          {
            id: 'root-container',
            type: 'div',
            content: '',
            styles: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              minHeight: '200px',
              width: '100%',
              backgroundColor: '#f9fafb'
            },
            tabletStyles: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              minHeight: '200px',
              width: '100%',
              backgroundColor: '#f9fafb'
            },
            mobileStyles: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '15px',
              minHeight: '200px',
              width: '100%',
              backgroundColor: '#f9fafb'
            },
            children: []
          }
        ]
      },
      styles: {}
    },
    selectedHtmlElementId: 'root-container',
    htmlWorkshopTemplateId: null,
    htmlWorkshopTemplateName: null,
    isHtmlWorkshopMode: true
  }),

  loadHtmlDesign: (template, sourceSectionId?: string) => set({
    htmlWorkshopSection: {
      ...template,
      type: 'html-builder' // Ensure type is correct
    },
    htmlWorkshopTemplateId: template._id || null,
    htmlWorkshopTemplateName: template.name || null,
    htmlWorkshopSourceSectionId: sourceSectionId || null,
    isHtmlWorkshopMode: true,
    selectedHtmlElementId: null
  }),

  undo: () => {
    const { past, page, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      page: ensureThankYouSection(previous),
      future: [page, ...future]
    });
  },

  redo: () => {
    const { past, page, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, page],
      page: ensureThankYouSection(next),
      future: newFuture
    });
  },

  setSelectedSection: (id) => set({ selectedSectionId: id, selectedHtmlElementId: null }),
  setSelectedHtmlElement: (id) => set({ selectedHtmlElementId: id }),
  setMode: (mode) => set({ mode }),
  setView: (view) => set({ view }),

  updateSection: (id, updates) => {
    const state = get();
    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        sections: state.page.sections.map((s) => s.id === id ? { ...s, ...updates } : s)
      })
    });
  },

  updateSectionContent: (id, content) => {
    const state = get();
    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        sections: state.page.sections.map((s) => s.id === id ? { ...s, content: { ...s.content, ...content } } : s)
      })
    });
  },

  updateSectionStyles: (id, styles) => {
    const state = get();
    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        sections: state.page.sections.map((s) => s.id === id ? { ...s, styles: { ...s.styles, ...styles } } : s)
      })
    });
  },

  addSection: (type, content, styles) => {
    const state = get();

    // Thank-you section is managed automatically with hero flow, not via manual add.
    if (type === 'thank-you') {
      return;
    }

    const typeStyles: Record<string, any> = {
      'case-studies': { backgroundColor: '#F3F8FF' },
      'technology-operations': { backgroundColor: '#F3F8FF' },
      'facility-showcase': { backgroundColor: '#ffffff' },
      'faq': { backgroundColor: '#F3F8FF' },
      'warehouses': { backgroundColor: '#F8FBFF' },
      'features': { backgroundColor: '#F8FBFF' },
      'network': { backgroundColor: '#ffffff' },
      'thank-you': { backgroundColor: '#F7F8FA' }
    };

    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      order: state.page.sections.length,
      content: content || defaultSections[type],
      styles: styles || { 
        backgroundColor: typeStyles[type]?.backgroundColor || '#ffffff', 
        textColor: '#333333', 
        headingColor: '#000000',
        primaryColor: '#ed1c24',
        accentColor: '#ed1c24',
        borderColor: '#e5e7eb'
      }
    };

    const thankYouIndex = state.page.sections.findIndex((s) => s.type === 'thank-you');
    const nextSections = [...state.page.sections];
    if (thankYouIndex >= 0) {
      nextSections.splice(thankYouIndex, 0, newSection);
    } else {
      nextSections.push(newSection);
    }

    const normalizedSections = nextSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        sections: normalizedSections
      }),
      selectedSectionId: newSection.id
    });
  },

  removeSection: (id) => {
    const state = get();
    const target = state.page.sections.find((s) => s.id === id);
    if (target?.type === 'thank-you') return;

    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        sections: state.page.sections.filter((s) => s.id !== id)
      }),
      selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId
    });
  },

  reorderSections: (sections) => {
    const state = get();
    const thankYouSection = sections.find((s) => s.type === 'thank-you');
    const reorderedSections = thankYouSection
      ? [...sections.filter((s) => s.type !== 'thank-you'), thankYouSection]
      : sections;

    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({ ...state.page, sections: reorderedSections })
    });
  },

  loadLogisticsTemplate: () => {
    const state = get();
    set({
      past: [...state.past, state.page],
      future: [],
      page: ensureThankYouSection({
        ...state.page,
        pageName: 'Mahindra Logistics',
        sections: [
          { id: '1', type: 'navbar', order: 0, content: { logo: 'Mahindra Logistics', links: [] }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#ed1c24' } },
          { id: '2', type: 'hero', order: 1, content: { ...defaultSections.hero }, styles: { backgroundImage: defaultSections.hero.backgroundImage, backgroundColor: '#000000', textColor: '#ffffff', primaryColor: '#E31837' } },
          { id: '3', type: 'about', order: 2, content: { ...defaultSections.about }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { id: '4', type: 'features', order: 3, content: { ...defaultSections.features }, styles: { backgroundColor: '#F8FBFF', textColor: '#000000', primaryColor: '#E31837' } },
          { id: '5', type: 'industries', order: 4, content: { ...defaultSections.industries }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { 
            id: 'why-choose-us-id', 
            type: 'why-choose-us', 
            order: 5, 
            content: { ...defaultSections['why-choose-us'] }, 
            styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } 
          },
          { id: '6', type: 'warehouses', order: 6, content: { ...defaultSections.warehouses }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { 
            id: 'tech-ops-id', 
            type: 'technology-operations', 
            order: 7, 
            content: { ...defaultSections['technology-operations'] }, 
            styles: { backgroundColor: '#F3F8FF', textColor: '#000000', primaryColor: '#E31837' } 
          },
          { 
            id: 'network-id', 
            type: 'network', 
            order: 8, 
            content: { ...defaultSections['network'] }, 
            styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } 
          },
          { id: 'facility-showcase-id', type: 'facility-showcase', order: 9, content: { ...defaultSections['facility-showcase'] }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { id: '7', type: 'faq', order: 10, content: { ...defaultSections.faq }, styles: { backgroundColor: '#F3F8FF', textColor: '#000000', primaryColor: '#E31837' } },
          { id: 'testimonials-id', type: 'testimonials', order: 11, content: { ...defaultSections.testimonials }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { id: 'case-studies-id', type: 'case-studies', order: 13, content: { ...defaultSections['case-studies'] }, styles: { backgroundColor: '#F3F8FF', textColor: '#000000', primaryColor: '#E31837' } },
          { id: 'brands-id', type: 'brands', order: 14, content: { ...defaultSections.brands }, styles: { backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#E31837' } },
          { 
            id: '8', 
            type: 'footer', 
            order: 16, 
            content: {
              logo: 'MAHINDRA LOGISTICS',
              logoImage: '/assets/images/86.png',
              logoColor: '#ffffff',
              description: 'Driving excellence in logistics and supply chain solutions across the globe.',
              descriptionColor: '#cbd5e1',
              ctaText: 'Get a Quote',
              phone: '+91 98765 43210',
              copyright: '© 2024 Mahindra Logistics. All rights reserved.',
              links: [
                { label: 'Privacy Policy', url: '#' },
                { label: 'Terms & Conditions', url: '#' }
              ]
            }, 
            styles: { backgroundColor: '#231F20', textColor: '#cbd5e1', primaryColor: '#E31837' } 
          }
        ]
      })
    });
  },

  addHtmlElement: (sectionId, parentId, type) => {
    const state = get();
    const section = state.page.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'html-builder') return;

    const newElement: HtmlElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'heading' ? 'New Heading' : type === 'paragraph' ? 'New Paragraph' : type === 'button' ? 'Button' : '',
      styles: {
        padding: '10px',
        margin: '5px',
        width: type === 'div' ? '100%' : 'auto',
        minHeight: type === 'div' ? '50px' : 'auto',
        display: type === 'div' ? 'block' : 'inline-block',
      },
      children: []
    };

    const addRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.map(el => {
        if (el.id === parentId) {
          return { ...el, children: [...(el.children || []), newElement] };
        }
        if (el.children) {
          return { ...el, children: addRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      past: [...state.past, state.page],
      future: [],
      page: {
        ...state.page,
        sections: state.page.sections.map(s => 
          s.id === sectionId 
            ? { ...s, content: { ...s.content, elements: addRecursive(s.content.elements || []) } } 
            : s
        )
      }
    });
  },

  updateHtmlElement: (sectionId, elementId, updates) => {
    const state = get();
    const section = state.page.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'html-builder') return;

    const updateRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.map(el => {
        if (el.id === elementId) {
          if (updates.styles) {
            const currentView = get().view;
            const { styles, ...otherUpdates } = updates;
            if (currentView === 'desktop') {
              return { 
                ...el, 
                ...otherUpdates, 
                styles: { ...el.styles, ...styles }
              };
            } else if (currentView === 'tablet') {
              return { 
                ...el, 
                ...otherUpdates, 
                tabletStyles: { ...(el.tabletStyles || {}), ...styles }
              };
            } else if (currentView === 'mobile') {
              return { 
                ...el, 
                ...otherUpdates, 
                mobileStyles: { ...(el.mobileStyles || {}), ...styles }
              };
            }
          }
          return { ...el, ...updates, styles: { ...el.styles, ...(updates.styles || {}) } };
        }
        if (el.children) {
          return { ...el, children: updateRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      past: [...state.past, state.page],
      future: [],
      page: {
        ...state.page,
        sections: state.page.sections.map(s => 
          s.id === sectionId 
            ? { ...s, content: { ...s.content, elements: updateRecursive(s.content.elements || []) } } 
            : s
        )
      }
    });
  },

  removeHtmlElement: (sectionId, elementId) => {
    const state = get();
    const section = state.page.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'html-builder') return;

    const removeRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.filter(el => el.id !== elementId).map(el => {
        if (el.children) {
          return { ...el, children: removeRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      past: [...state.past, state.page],
      future: [],
      page: {
        ...state.page,
        sections: state.page.sections.map(s => 
          s.id === sectionId 
            ? { ...s, content: { ...s.content, elements: removeRecursive(s.content.elements || []) } } 
            : s
        )
      },
      selectedHtmlElementId: state.selectedHtmlElementId === elementId ? null : state.selectedHtmlElementId
    });
  },

  addWorkshopHtmlElement: (parentId, type) => {
    const state = get();
    const section = state.htmlWorkshopSection;
    if (!section) return;

    const newElement: HtmlElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'heading' ? 'New Heading' : type === 'paragraph' ? 'New Paragraph' : type === 'button' ? 'Button' : '',
      styles: {
        padding: '10px',
        margin: '5px',
        width: type === 'div' ? '100%' : 'auto',
        minHeight: type === 'div' ? '50px' : 'auto',
        display: type === 'div' ? 'block' : 'inline-block',
      },
      tabletStyles: {
        padding: '10px',
        margin: '5px',
        width: type === 'div' ? '100%' : 'auto',
        minHeight: type === 'div' ? '50px' : 'auto',
        display: type === 'div' ? 'block' : 'inline-block',
      },
      mobileStyles: {
        padding: '10px',
        margin: '5px',
        width: type === 'div' ? '100%' : 'auto',
        minHeight: type === 'div' ? '50px' : 'auto',
        display: type === 'div' ? 'block' : 'inline-block',
      },
      children: []
    };

    const addRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.map(el => {
        if (el.id === parentId) {
          return { ...el, children: [...(el.children || []), newElement] };
        }
        if (el.children) {
          return { ...el, children: addRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      htmlWorkshopSection: { ...section, content: { ...section.content, elements: addRecursive(section.content.elements || []) } }
    });
  },

  updateWorkshopHtmlElement: (elementId, updates) => {
    const state = get();
    const section = state.htmlWorkshopSection;
    if (!section) return;

    const updateRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.map(el => {
        if (el.id === elementId) {
          if (updates.styles) {
            const currentView = get().view;
            const { styles, ...otherUpdates } = updates;
            if (currentView === 'desktop') {
              return { 
                ...el, 
                ...otherUpdates, 
                styles: { ...el.styles, ...styles }
              };
            } else if (currentView === 'tablet') {
              return { 
                ...el, 
                ...otherUpdates, 
                tabletStyles: { ...(el.tabletStyles || {}), ...styles }
              };
            } else if (currentView === 'mobile') {
              return { 
                ...el, 
                ...otherUpdates, 
                mobileStyles: { ...(el.mobileStyles || {}), ...styles }
              };
            }
          }
          return { ...el, ...updates, styles: { ...el.styles, ...(updates.styles || {}) } };
        }
        if (el.children) {
          return { ...el, children: updateRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      htmlWorkshopSection: { ...section, content: { ...section.content, elements: updateRecursive(section.content.elements || []) } }
    });
  },

  removeWorkshopHtmlElement: (elementId) => {
    const state = get();
    const section = state.htmlWorkshopSection;
    if (!section) return;

    const removeRecursive = (elements: HtmlElement[]): HtmlElement[] => {
      return elements.filter(el => el.id !== elementId).map(el => {
        if (el.children) {
          return { ...el, children: removeRecursive(el.children) };
        }
        return el;
      });
    };

    set({
      htmlWorkshopSection: { ...section, content: { ...section.content, elements: removeRecursive(section.content.elements || []) } },
      selectedHtmlElementId: state.selectedHtmlElementId === elementId ? null : state.selectedHtmlElementId
    });
  }
}));

