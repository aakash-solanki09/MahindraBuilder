const { URLSearchParams } = require('url');

const reqBody = {
  first_name: 'Test',
  last_name: 'New',
  email: 'testnew@example.com',
  mobile: '9999999999',
  city: 'Mumbai',
  zip: '400001',
  company: 'Testing Co',
  '00N4x00000bbbE3': 'Surface Express',
  '00N4x00000bbbEM': 'remarks here',
  Entity__c: 'MESPL',
  Vertical_DH__c: 'Not specified',
  lead_source: 'Campaign',
  _fieldMap: {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    mobile: 'mobile',
    city: 'city',
    zip: 'zip',
    company: 'company',
    '00N4x00000bbbE3': '00N4x00000bbbE3',
    '00N4x00000bbbEM': '00N4x00000bbbEM',
    Entity__c: 'Entity__c',
    Vertical_DH__c: 'Vertical_DH__c',
    lead_source: 'lead_source'
  }
};

const params = new URLSearchParams();
const sfOrgId = '00D4x000007sh6p';
params.append('oid', sfOrgId);
params.append('retURL', 'http://google.com');
params.append('recordType', '012Vt0000023hFO');

const leadSource = reqBody.lead_source || 'Campaign';
if (leadSource && !params.has('lead_source')) params.append('lead_source', leadSource);

const entity = reqBody.Entity__c || 'MESPL';
if (entity && !params.has('Entity__c')) params.append('Entity__c', entity);

const verticalDh = reqBody.Vertical_DH__c || 'Not specified';
if (verticalDh && !params.has('Vertical_DH__c')) params.append('Vertical_DH__c', verticalDh);

params.append('debug', '1');
params.append('debugEmail', 'amin.noumita@mahindralogistics.com');

const STANDARD_SF_FIELDS = ['first_name', 'last_name', 'email', 'company', 'city', 'zip', 'mobile', 'phone'];

for (const [formFieldName, sfFieldId] of Object.entries(reqBody._fieldMap)) {
  if (STANDARD_SF_FIELDS.includes(formFieldName)) continue;
  
  const value = reqBody[formFieldName];
  if (value !== undefined && value !== null) {
    if (!params.has(sfFieldId)) {
      params.append(sfFieldId, String(value));
    }
  }
}

params.append('first_name', reqBody.first_name || '');
params.append('last_name', reqBody.last_name || '');
params.append('email', reqBody.email || '');
params.append('company', reqBody.company || '');
params.append('city', reqBody.city || '');
params.append('zip', reqBody.zip || '');
params.append('mobile', reqBody.mobile || '');
params.append('phone', reqBody.mobile || '');

console.log('Final Params:');
console.log(params.toString().split('&').join('\n'));
