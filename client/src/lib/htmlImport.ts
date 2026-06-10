import type { HtmlElement, HtmlElementType } from '../types';

export interface HtmlImportResult {
  elements: HtmlElement[];
  styles: Record<string, string>;
}

type CssRule = {
  selectors: string[];
  styles: Record<string, string>;
};

const allowedTagMap: Record<string, HtmlElementType> = {
  div: 'div',
  section: 'div',
  article: 'div',
  main: 'div',
  header: 'div',
  footer: 'div',
  nav: 'div',
  span: 'span',
  p: 'paragraph',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  img: 'image',
  button: 'button',
  a: 'link',
  form: 'form',
  label: 'label',
  input: 'input',
  select: 'select',
  textarea: 'textarea',
  option: 'option',
};

const createId = () => Math.random().toString(36).slice(2, 11);

const parseStyleText = (styleText = ''): Record<string, string> => {
  return styleText
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex === -1) return accumulator;

      const property = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      if (!property || !value) return accumulator;

      accumulator[property] = value;
      return accumulator;
    }, {});
};

const parseCssRules = (cssText = ''): CssRule[] => {
  const strippedCss = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = strippedCss.split('}');

  return blocks.flatMap((block) => {
    const [selectorChunk, declarationChunk] = block.split('{');
    const selectorText = selectorChunk?.trim();
    const declarationText = declarationChunk?.trim();

    if (!selectorText || !declarationText || selectorText.startsWith('@')) {
      return [];
    }

    const styles = parseStyleText(declarationText);
    const selectors = selectorText
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean);

    if (!selectors.length || !Object.keys(styles).length) {
      return [];
    }

    return [{ selectors, styles }];
  });
};

const collectAttributes = (element: Element) => {
  return Array.from(element.attributes).reduce<Record<string, string>>((accumulator, attr) => {
    if (attr.name.startsWith('on') || attr.name === 'style') return accumulator;
    accumulator[attr.name] = attr.value;
    return accumulator;
  }, {});
};

const applyRules = (element: Element, rules: CssRule[], baseStyles: Record<string, string> = {}) => {
  return rules.reduce<Record<string, string>>((accumulator, rule) => {
    const matched = rule.selectors.some((selector) => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });

    return matched ? { ...accumulator, ...rule.styles } : accumulator;
  }, { ...baseStyles });
};

const getDirectText = (element: Element) => {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildElementTree = (element: Element, rules: CssRule[]): HtmlElement[] => {
  const tagName = element.tagName.toLowerCase();

  if (['script', 'style', 'meta', 'link', 'title', 'head', 'html', 'body'].includes(tagName)) {
    return Array.from(element.children).flatMap((child) => buildElementTree(child, rules));
  }

  const mappedType = allowedTagMap[tagName];
  if (!mappedType) {
    return Array.from(element.children).flatMap((child) => buildElementTree(child, rules));
  }

  const attributes = collectAttributes(element);
  const inlineStyles = parseStyleText(element.getAttribute('style') || '');
  const styles = applyRules(element, rules, inlineStyles);
  const childElements = Array.from(element.children).flatMap((child) => buildElementTree(child, rules));
  const directText = getDirectText(element);
  const textTypes = new Set<HtmlElementType>(['heading', 'paragraph', 'button', 'label', 'option', 'span', 'link', 'textarea']);

  const htmlElement: HtmlElement = {
    id: attributes.id || createId(),
    type: mappedType,
    content: textTypes.has(mappedType) && childElements.length === 0 ? directText : '',
    styles,
    attributes,
    children: childElements,
  };

  if (mappedType === 'image') {
    htmlElement.content = attributes.src || '';
  }

  if (mappedType === 'input') {
    htmlElement.content = attributes.value || '';
  }

  if (mappedType === 'textarea') {
    htmlElement.content = directText || attributes.value || '';
  }

  return [htmlElement];
};

export const parseHtmlCssToWorkshopSection = (html: string, css: string = ''): HtmlImportResult => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const embeddedCss = Array.from(document.querySelectorAll('style'))
    .map((styleTag) => styleTag.textContent || '')
    .join('\n');
  const combinedCss = [css, embeddedCss].filter(Boolean).join('\n');
  const rules = parseCssRules(combinedCss);

  document.querySelectorAll('script').forEach((node) => node.remove());
  document.querySelectorAll('style').forEach((node) => node.remove());

  const bodyStyles = applyRules(document.body, rules, parseStyleText(document.body.getAttribute('style') || ''));
  const bodyChildren = Array.from(document.body.children).flatMap((child) => buildElementTree(child, rules));

  return {
    elements: [
      {
        id: 'root-container',
        type: 'div',
        content: '',
        styles: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          padding: '0px',
          minHeight: 'auto',
          width: '100%',
          ...bodyStyles,
        },
        children: bodyChildren,
      },
    ],
    styles: bodyStyles,
  };
};