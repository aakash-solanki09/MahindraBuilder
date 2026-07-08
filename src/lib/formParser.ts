import type { FormField } from '../types';

/**
 * Parse HTML form code and extract form fields.
 * Detects: <input>, <select>, <textarea> elements inside a <form>
 */
export interface ParsedFormField {
  name: string;
  label: string;
  type: FormField['type'];
  placeholder: string;
  required: boolean;
  maxLength?: number;
  pattern?: string;
  options?: string[];
  salesforceFieldId?: string;
}

export function parseHtmlForm(html: string): ParsedFormField[] {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const fields: ParsedFormField[] = [];

  // Match inputs
  const inputRegex = /<input\b[^>]*>/gi;
  let match;
  while ((match = inputRegex.exec(cleanHtml)) !== null) {
    const attrs = parseAttributes(match[0]);
    const type = (attrs.type || 'text').toLowerCase();
    
    // Skip submit/button/reset/image/hidden
    if (['submit', 'button', 'reset', 'image', 'hidden'].includes(type)) {
      continue;
    }

    const name = attrs.name || attrs.id || '';
    if (!name) continue;

    const label = findLabel(cleanHtml, name, attrs);
    fields.push(createField(name, label, type, attrs));
  }

  // Match select
  const selectRegex = /<select\b([^>]*?)>([\s\S]*?)<\/select>/gi;
  while ((match = selectRegex.exec(cleanHtml)) !== null) {
    const attrs = parseAttributes(match[1]);
    const innerContent = match[2];
    const name = attrs.name || attrs.id || '';
    if (!name) continue;

    const label = findLabel(cleanHtml, name, attrs);
    const field = createField(name, label, 'select', attrs);

    // Extract options
    const optionRegex = /<option\b[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
    const options: string[] = [];
    let optMatch;
    while ((optMatch = optionRegex.exec(innerContent)) !== null) {
      const optValue = optMatch[1];
      if (optValue && optValue !== '') {
        options.push(optValue);
      }
    }
    if (options.length > 0) {
      field.options = options;
    }

    fields.push(field);
  }

  // Match textarea
  const textareaRegex = /<textarea\b([^>]*?)>([\s\S]*?)<\/textarea>/gi;
  while ((match = textareaRegex.exec(cleanHtml)) !== null) {
    const attrs = parseAttributes(match[1]);
    const name = attrs.name || attrs.id || '';
    if (!name) continue;

    const label = findLabel(cleanHtml, name, attrs);
    fields.push(createField(name, label, 'textarea', attrs));
  }

  return fields;
}

/**
 * Extract <form action="..."> URL and hidden inputs (like oid, recordType)
 */
export interface ParsedFormMeta {
  action?: string;
  hiddenFields: Record<string, string>;
}

export function parseFormMeta(html: string): ParsedFormMeta {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const meta: ParsedFormMeta = { hiddenFields: {} };

  // Extract form attributes
  const formRegex = /<form\b([^>]*?)>/i;
  const formMatch = cleanHtml.match(formRegex);
  if (formMatch) {
    const formAttrs = parseAttributes(formMatch[1]);
    if (formAttrs.action) {
      meta.action = formAttrs.action;
    }
  }

  // Extract hidden input values
  const inputRegex = /<input\b[^>]*>/gi;
  let match;
  while ((match = inputRegex.exec(cleanHtml)) !== null) {
    const attrs = parseAttributes(match[0]);
    if (attrs.type === 'hidden' && attrs.name && attrs.value !== undefined) {
      meta.hiddenFields[attrs.name] = attrs.value;
    }
  }

  return meta;
}

function findLabel(html: string, name: string, attrs: Record<string, any>): string {
  let label = attrs['aria-label'] || attrs.placeholder || attrs.title || '';
  if (!label) {
    // Look for <label for="fieldName"> text
    const labelRegex = new RegExp(`<label\\b[^>]*\\bfor=["']${escapeRegex(name)}["'][^>]*>([\\s\\S]*?)<\\/label>`, 'i');
    const labelMatch = html.match(labelRegex);
    if (labelMatch) {
      label = labelMatch[1].replace(/<[^>]*>/g, '').trim();
    }
  }
  if (!label) {
    label = name.replace(/[_-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  }
  return label;
}

function createField(name: string, label: string, type: string, attrs: Record<string, any>): ParsedFormField {
  let fieldType: FormField['type'] = 'text';
  if (type === 'select') {
    fieldType = 'select';
  } else if (type === 'textarea') {
    fieldType = 'textarea';
  } else if (type === 'email') {
    fieldType = 'email';
  } else if (type === 'tel' || type === 'phone') {
    fieldType = 'tel';
  } else if (type === 'number') {
    fieldType = 'number';
  }

  return {
    name,
    label,
    type: fieldType,
    placeholder: attrs.placeholder || '',
    required: attrs.required !== undefined || attrs['aria-required'] === 'true',
    maxLength: attrs.maxlength ? parseInt(attrs.maxlength) : undefined,
    pattern: attrs.pattern || undefined,
    salesforceFieldId: name,
  };
}

function parseAttributes(attrString: string): Record<string, any> {
  const attrs: Record<string, any> = {};
  // Match name="value" or name='value' or name (boolean)
  const attrRegex = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : true;
    attrs[name] = value;
  }
  return attrs;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
