const fs = require('fs');
const path = '/Users/apple/Desktop/All Project/MahindraBuilder/server/controllers/leadController.ts';

let content = fs.readFileSync(path, 'utf8');

const targetStr = `      const leadSource = process.env.SALESFORCE_LEAD_SOURCE || req.body.lead_source;
      if (leadSource) params.append('lead_source', leadSource);`;

const newStr = `      const leadSource = process.env.SALESFORCE_LEAD_SOURCE || req.body.lead_source || 'Campaign';
      if (leadSource) params.append('lead_source', leadSource);
      
      const entity = req.body.Entity__c || 'MESPL';
      if (entity) params.append('Entity__c', entity);
      
      const verticalDh = req.body.Vertical_DH__c || 'Not specified';
      if (verticalDh) params.append('Vertical_DH__c', verticalDh);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully added Salesforce fallbacks.');
} else {
  console.log('Target string not found.');
}
