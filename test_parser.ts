import { parseHtmlForm } from './src/lib/formParser';

const html = `
<form action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D4x000007sh6p" method="POST">
  <input type=hidden name="oid" value="00D4x000007sh6p">
  <input type=hidden name="Vertical_DH__c" value="Not specified">
  <input type=hidden name="lead_source" value="Campaign">
  <input type=hidden name="Entity__c" value="MESPL">
  <input id="first_name" name="first_name" type="text" required/>
</form>
`;

console.log(JSON.stringify(parseHtmlForm(html), null, 2));
