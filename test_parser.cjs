// Native JS test
const fs = require('fs');

function parseAttributes(attrString) {
  const attrs = {};
  const attrRegex = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : true;
    attrs[name] = value;
  }
  return attrs;
}

function parseHtmlForm(html) {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const fields = [];
  const inputRegex = /<input\b[^>]*>/gi;
  let match;
  while ((match = inputRegex.exec(cleanHtml)) !== null) {
    const attrs = parseAttributes(match[0]);
    const type = (attrs.type || 'text').toLowerCase();
    if (['submit', 'button', 'reset', 'image'].includes(type)) continue;
    const name = attrs.name || attrs.id || '';
    if (!name) continue;
    if (type === 'hidden' && ['oid', 'returl', 'recordtype', 'debug', 'debugemail'].includes(name.toLowerCase())) continue;
    fields.push({
      name,
      type,
      placeholder: type === 'hidden' ? (attrs.value || '') : (attrs.placeholder || '')
    });
  }
  return fields;
}

const html = `
<form action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D4x000007sh6p" method="POST">
  <input type=hidden name="Vertical_DH__c" value="Not specified">
  <input type=hidden name="lead_source" value="Campaign">
  <input type="hidden" name="debug" value=1>
</form>
`;

console.log(JSON.stringify(parseHtmlForm(html), null, 2));
