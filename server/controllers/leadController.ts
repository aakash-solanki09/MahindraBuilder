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

    // Compute remarks from known fields (No hardcoded SF IDs here)
    const remarks = String(
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
      interestedIn: req.body.interestedIn || req.body.interest || '', // No hardcoded fallback
    };

    const lead = new Lead(leadPayload);
    await lead.save();

    // Salesforce Web-To-Lead integration
    try {
      // Use page-specific Salesforce config, fallback strictly to env vars
      const baseSfUrl = sfConfig.url || process.env.SALESFORCE_URL;
      const sfOrgId = sfConfig.orgId || process.env.SALESFORCE_ORG_ID || req.body.oid;
      
      // Strict check as requested: Error out if missing dynamic config
      if (!baseSfUrl || !sfOrgId) {
        throw new Error('Missing critical Salesforce Configuration (URL or Org ID). No hardcoded fallback available.');
      }

      let sfUrl = baseSfUrl;
      if (!sfUrl.includes('orgId=') && !sfUrl.includes('oid=')) {
        const separator = sfUrl.includes('?') ? '&' : '?';
        sfUrl = `${sfUrl}${separator}orgId=${sfOrgId}`;
      }

      const params = new URLSearchParams();
      params.append('oid', sfOrgId);
      
      // Strict fallbacks - Only append if value exists in dynamic request or .env
      const retURL = req.body.retURL || process.env.SALESFORCE_RET_URL;
      if (retURL) params.append('retURL', retURL);
      
      const recordType = sfConfig.recordType || process.env.SALESFORCE_RECORD_TYPE || req.body.recordType;
      if (recordType) params.append('recordType', recordType);
      
      const leadSource = process.env.SALESFORCE_LEAD_SOURCE || req.body.lead_source;
      if (leadSource) params.append('lead_source', leadSource);
      
      if (process.env.SALESFORCE_DEBUG !== undefined || sfConfig.debug !== undefined || req.body.debug !== undefined) {
        params.append('debug', process.env.SALESFORCE_DEBUG !== undefined ? process.env.SALESFORCE_DEBUG : String(sfConfig.debug ?? req.body.debug ?? 0));
      }
      
      const debugEmail = process.env.SALESFORCE_DEBUG_EMAIL || sfConfig.debugEmail || req.body.debugEmail;
      if (debugEmail) params.append('debugEmail', debugEmail);

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

      if (mobile) {
        params.append('mobile', mobile);
        params.append('phone', mobile);
      }

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
        console.warn('[Salesforce] No dynamic _fieldMap provided. Only standard fields will be sent.');
      }

      // Dynamic fallback for any additional env vars if they exist
      const verticalDh = process.env.SALESFORCE_VERTICAL || req.body.Vertical_DH__c;
      if (verticalDh && !params.has('Vertical_DH__c')) params.append('Vertical_DH__c', verticalDh);
      
      const entity = process.env.SALESFORCE_ENTITY || req.body.Entity__c;
      if (entity && !params.has('Entity__c')) params.append('Entity__c', entity);

      console.log('[Salesforce] Forwarding lead to:', sfUrl);
      const sfRes = await fetch(sfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const sfResText = await sfRes.text();
      console.log('[Salesforce] Lead forwarded. Status:', sfRes.status, 'Response:', sfResText.slice(0, 500));
    } catch (sfEx: any) {
      console.error('[Salesforce] Exception caught during lead preparation:', sfEx);
      // 🔥 Return 400 Error as requested by user if dynamic config fails
      return res.status(400).json({ message: sfEx instanceof Error ? sfEx.message : 'Salesforce Integration Error' });
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
