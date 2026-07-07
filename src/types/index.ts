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

export interface FormField {
  name: string;
  label?: string;
  placeholder: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'tel' | 'hidden';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'decimal' | 'search';
  prefix?: string;
  options?: string[];
  // Salesforce mapping
  salesforceFieldId?: string;
  // Style overrides
  labelColor?: string;
  labelBgColor?: string;
  labelBorderColor?: string;
  placeholderColor?: string;
  placeholderBgColor?: string;
  placeholderBorderColor?: string;
  inputColor?: string;
  inputBgColor?: string;
  inputBorderColor?: string;
}

export interface HeroContent {
  title1?: string;
  title2?: string;
  title3?: string;
  title1Color?: string;
  title2Color?: string;
  title3Color?: string;
  title1BgColor?: string;
  title2BgColor?: string;
  title3BgColor?: string;
  title1BorderColor?: string;
  title2BorderColor?: string;
  title3BorderColor?: string;
  subtitle: string;
  subtitleColor?: string;
  subtitleBgColor?: string;
  buttonText: string;
  submitButtonText?: string;
  submitButtonTextColor?: string;
  submitButtonTextBgColor?: string;
  submitButtonTextBorderColor?: string;
  backgroundImage?: string;
  formTitle?: string;
  formTitleColor?: string;
  formTitleBgColor?: string;
  formFields?: FormField[];
  // Thank-you page content
  thankYouHeading?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  thankYouButtonText?: string;
  // Salesforce configuration (per-page override)
  salesforce?: {
    url?: string;
    orgId?: string;
    recordType?: string;
    debug?: number;
    debugEmail?: string;
  };
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
    logoImage?: string;
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
  brandName?: string;
  brandLogo?: string;
}
