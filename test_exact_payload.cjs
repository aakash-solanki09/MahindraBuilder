const { URLSearchParams } = require('url');
const params = new URLSearchParams();

const reqBody = {
  first_name: 'Hakim',
  last_name: 'sefi',
  email: 'hakim@gmail.com',
  mobile: '7974489583',
  company: 'abc company',
  city: 'Indore Madhya Pradesh',
  zip: '4520090',
  '00N4x00000bbbE3': 'Surface Express',
  '00N4x00000bbbEM': 'please dont call its for testing',
  Vertical_DH__c: 'Not specified',
  lead_source: 'Campaign',
  Entity__c: 'MESPL',
  _fieldMap: {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    mobile: 'mobile',
    company: 'company',
    city: 'city',
    zip: 'zip',
    '00N4x00000bbbE3': '00N4x00000bbbE3',
    '00N4x00000bbbEM': '00N4x00000bbbEM',
    Vertical_DH__c: 'Vertical_DH__c',
    lead_source: 'lead_source',
    Entity__c: 'Entity__c'
  },
  _computedRemarks: 'please dont call its for testing'
};

const sfOrgId = '00D4x000007sh6p';
params.append('oid', sfOrgId);

const retURL = reqBody.retURL || 'http://google.com';
if (retURL) params.append('retURL', retURL);

const recordType = '012Vt0000023hFO';
if (recordType) params.append('recordType', recordType);

const leadSource = reqBody.lead_source || 'Campaign';
if (leadSource && !params.has('lead_source')) params.append('lead_source', leadSource);

const entity = reqBody.Entity__c || 'MESPL';
if (entity && !params.has('Entity__c')) params.append('Entity__c', entity);

const verticalDh = reqBody.Vertical_DH__c || 'Not specified';
if (verticalDh && !params.has('Vertical_DH__c')) params.append('Vertical_DH__c', verticalDh);

params.append('debug', '1');
params.append('debugEmail', 'amin.noumita@mahindralogistics.com');

let firstName = reqBody.first_name || '';
let lastName = reqBody.last_name || '';

params.append('first_name', firstName);
params.append('last_name', lastName);
params.append('email', reqBody.email || '');
params.append('company', reqBody.company || 'Not specified');
params.append('city', reqBody.city || '');
params.append('zip', reqBody.zip || '');

const mobile = '7974489583';
if (mobile) {
  params.append('mobile', mobile);
  params.append('phone', mobile);
}

const STANDARD_SF_FIELDS = ['first_name', 'last_name', 'email', 'company', 'city', 'zip', 'mobile', 'phone'];

for (const [formFieldName, sfFieldId] of Object.entries(reqBody._fieldMap)) {
  if (STANDARD_SF_FIELDS.includes(formFieldName)) continue;
  
  const value = reqBody[formFieldName];
  if (value !== undefined && value !== null) {
    params.append(sfFieldId, String(value));
  }
}

if (!params.has('00N4x00000bbbE3')) {
  params.append('00N4x00000bbbE3', reqBody['00N4x00000bbbE3'] || 'Surface Express');
}
if (!params.has('00N4x00000bbbEM')) {
  params.append('00N4x00000bbbEM', reqBody._computedRemarks);
}

console.log('NEW CODE PAYLOAD:');
console.log(params.toString().split('&').join('\n'));
