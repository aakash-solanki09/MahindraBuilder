export type SectionType = 
  | 'navbar' 
  | 'hero' 
  | 'about' 
  | 'features' 
  | 'industries' 
  | 'warehouses' 
  | 'why-choose-us' 
  | 'maps' 
  | 'video' 
  | 'faq' 
  | 'testimonials' 
  | 'case-studies'
  | 'brands' 
  | 'technology-operations'
  | 'facility-showcase'
  | 'custom'
  | 'html-builder'
  | 'network'
  | 'thank-you'
  | 'footer';

export type HtmlElementType =
  | 'div'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'span'
  | 'link'
  | 'form'
  | 'input'
  | 'select'
  | 'textarea'
  | 'label'
  | 'option';

export interface HtmlElement {
  id: string;
  type: HtmlElementType;
  content: string;
  styles: Record<string, string>;
  attributes?: Record<string, string>;
  tabletStyles?: Record<string, string>;
  mobileStyles?: Record<string, string>;
  children: HtmlElement[];
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    primaryColor?: string;
    accentColor?: string;
    borderColor?: string;
    padding?: string;
    backgroundImage?: string;
  };
}

export interface PageData {
  _id?: string;
  pageName: string;
  slug: string;
  published: boolean;
  meta: {
    title: string;
    description: string;
    gaMeasurementId?: string;
    gtmId?: string;
    pixelId?: string;
    floatingCta?: {
      text?: string;
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    attributes?: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content: string;
    }>;
    links?: Array<{
      rel: string;
      href: string;
    }>;
  };
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  sections: Section[];
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name?: string;
  token?: string;
}
