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
  const fields: ParsedFormField[] = [];

  // Extract all form-related elements
  // Match <input ...>, <select>...</select>, <textarea>...</textarea>
  const elementRegex = /<(input|select|textarea)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/gi;
  let match;

  while ((match = elementRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrsStr = match[2];
    const innerContent = match[3] || '';

    // Parse attributes
    const attrs = parseAttributes(attrsStr);

    // Skip submit/button/hidden types
    const type = (attrs.type || 'text').toLowerCase();
    if (tagName === 'input' && ['submit', 'button', 'reset', 'image', 'hidden'].includes(type)) {
      // Allow hidden only if it has a name we want to track
      if (type === 'hidden' && !attrs.name) continue;
    }

    const name = attrs.name || attrs.id || '';
    if (!name) continue; // Skip elements without name/id

    // Try to find associated label
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
      label = name.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    // Determine field type
    let fieldType: FormField['type'] = 'text';
    if (tagName === 'select') {
      fieldType = 'select';
    } else if (tagName === 'textarea') {
      fieldType = 'textarea';
    } else if (type === 'email') {
      fieldType = 'email';
    } else if (type === 'tel' || type === 'phone') {
      fieldType = 'tel';
    } else if (type === 'number') {
      fieldType = 'number';
    }

    const field: ParsedFormField = {
      name,
      label,
      type: fieldType,
      placeholder: attrs.placeholder || '',
      required: attrs.required !== undefined || attrs['aria-required'] === 'true',
      maxLength: attrs.maxlength ? parseInt(attrs.maxlength) : undefined,
      pattern: attrs.pattern || undefined,
      salesforceFieldId: name, // Default: use name as Salesforce field ID
    };

    // Extract select options
    if (tagName === 'select') {
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
    }

    fields.push(field);
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
  const meta: ParsedFormMeta = { hiddenFields: {} };

  // Extract form action
  const actionMatch = html.match(/<form\b[^>]*\baction=["']([^"']*)["']/i);
  if (actionMatch) {
    meta.action = actionMatch[1];
  }

  // Extract hidden input values
  const hiddenRegex = /<input\b[^>]*\btype=["']hidden["'][^>]*>/gi;
  let match;
  while ((match = hiddenRegex.exec(html)) !== null) {
    const attrs = parseAttributes(match[0]);
    if (attrs.name && attrs.value !== undefined) {
      meta.hiddenFields[attrs.name] = attrs.value;
    }
  }

  return meta;
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
