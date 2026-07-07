import { Request, Response } from 'express';
import { Lead } from '../models/Lead';

// Known Salesforce standard fields (always mapped by name)
const STANDARD_SF_FIELDS = ['first_name', 'last_name', 'email', 'company', 'city', 'zip', 'mobile', 'phone'];

export const createLead = async (req: Request, res: Response) => {
  try {
    // 🔥 Extract dynamic mapping metadata from request
    const fieldMap: Record<string, string> = req.body._fieldMap || {};
    const sfConfig: Record<string, any> = req.body._salesforce || {};

    // Remove meta fields before saving to MongoDB
    delete req.body._fieldMap;
    delete req.body._salesforce;

    const fullName = String(req.body.name || `${req.body.first_name || ''} ${req.body.last_name || ''}`).trim();

    // Compute remarks from known fields
    const remarks = String(
      req.body['00N4x00000bbbEM'] ||
      req.body.needs ||
      req.body.remarks ||
      req.body.message ||
      ''
    ).trim();

    const leadPayload = {
      ...req.body,
      name: fullName || 'Not specified',
      phone: req.body.phone || req.body.mobile || '',
      needs: req.body.needs || remarks,
      message: req.body.message || remarks,
      interestedIn: req.body['00N4x00000bbbE3'] || req.body.interestedIn || req.body.interest || 'Surface Express',
    };

    const lead = new Lead(leadPayload);
    await lead.save();

    // Salesforce Web-To-Lead integration
    try {
      // Use page-specific Salesforce config, fallback to env vars
      const baseSfUrl = sfConfig.url || process.env.SALESFORCE_URL || 'https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
      const sfOrgId = sfConfig.orgId || process.env.SALESFORCE_ORG_ID || req.body.oid || '00D7g0000008mjW';
      
      const sfUrl = baseSfUrl.includes('orgId=') ? baseSfUrl : `${baseSfUrl}&orgId=${sfOrgId}`;

      const params = new URLSearchParams();
      params.append('oid', sfOrgId);
      params.append('retURL', req.body.retURL || 'http://google.com');
      params.append('recordType', sfConfig.recordType || process.env.SALESFORCE_RECORD_TYPE || req.body.recordType || '012E2000002wUsb');
      params.append('lead_source', process.env.SALESFORCE_LEAD_SOURCE || req.body.lead_source || 'Campaign');
      params.append('debug', process.env.SALESFORCE_DEBUG !== undefined ? process.env.SALESFORCE_DEBUG : String(sfConfig.debug ?? req.body.debug ?? 0));
      params.append('debugEmail', process.env.SALESFORCE_DEBUG_EMAIL || sfConfig.debugEmail || req.body.debugEmail || 'amin.noumita@mahindralogistics.com');

      // Standard Salesforce fields
      let firstName = req.body.first_name || '';
      let lastName = req.body.last_name || '';
      if (fullName && !firstName && !lastName) {
        const parts = fullName.split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }
      if (!firstName) firstName = 'Not specified';
      if (!lastName) lastName = 'Not specified';

      params.append('first_name', firstName);
      params.append('last_name', lastName);
      params.append('email', req.body.email || '');
      params.append('company', req.body.company || 'Not specified');
      params.append('city', req.body.city || '');
      params.append('zip', req.body.zip || req.body.pincode || req.body.pin || '');

      // Sanitize mobile
      const rawMobile = String(req.body.mobile || req.body.phone || '');
      const cleanMobile = rawMobile.replace(/\D/g, '');
      const mobile = cleanMobile.length === 12 && cleanMobile.startsWith('91')
        ? cleanMobile.slice(2)
        : cleanMobile.length === 11 && cleanMobile.startsWith('0')
          ? cleanMobile.slice(1)
          : cleanMobile.length === 10
            ? cleanMobile
            : '';

      params.append('mobile', mobile);
      params.append('phone', mobile);

      // 🔥 DYNAMIC: Map custom fields using _fieldMap from Hero
      if (Object.keys(fieldMap).length > 0) {
        console.log('[Salesforce-DYNAMIC] Using field map:', fieldMap);
        for (const [formFieldName, sfFieldId] of Object.entries(fieldMap)) {
          // Skip standard fields (already handled above)
          if (STANDARD_SF_FIELDS.includes(formFieldName)) continue;
          
          const value = req.body[formFieldName];
          if (value !== undefined && value !== null) {
            params.append(sfFieldId, String(value));
            console.log(`[Salesforce-DYNAMIC] Mapped ${formFieldName} → ${sfFieldId} = ${String(value).slice(0, 50)}`);
          }
        }
      } else {
        // Fallback: legacy hardcoded mapping
        params.append('00N4x00000bbbE3', req.body['00N4x00000bbbE3'] || req.body.interestedIn || req.body.interest || 'Surface Express');
        params.append('00N4x00000bbbEM', remarks);
        params.append('Vertical_DH__c', process.env.SALESFORCE_VERTICAL || req.body.Vertical_DH__c || 'Not specified');
        params.append('Entity__c', process.env.SALESFORCE_ENTITY || req.body.Entity__c || 'MESPL');
      }

      console.log('[Salesforce] Forwarding lead to:', sfUrl);
      const sfRes = await fetch(sfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const sfResText = await sfRes.text();
      console.log('[Salesforce] Lead forwarded. Status:', sfRes.status, 'Response:', sfResText.slice(0, 500));
    } catch (sfEx) {
      console.error('[Salesforce] Exception caught during lead preparation:', sfEx);
    }

    res.status(201).json({ message: 'Lead captured successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllLeads = async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
