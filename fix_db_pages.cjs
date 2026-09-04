const mongoose = require('mongoose');
const { Page } = require('./server/models/Page');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env.docker.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const pages = await Page.find();
  let updatedCount = 0;
  for (let page of pages) {
    let updated = false;
    if (page.sections) {
      for (let section of page.sections) {
        if (section.type === 'hero' && section.content && Array.isArray(section.content.formFields)) {
          const originalLength = section.content.formFields.length;
          section.content.formFields = section.content.formFields.filter(f => 
            f.name !== 'Entity__c' && 
            f.name !== 'Vertical_DH__c' && 
            f.name !== 'lead_source'
          );
          if (section.content.formFields.length !== originalLength) {
            updated = true;
          }
        }
      }
    }
    if (updated) {
      page.markModified('sections');
      await page.save();
      updatedCount++;
      console.log('Fixed page:', page.slug);
    }
  }
  console.log('Total pages updated:', updatedCount);
  mongoose.disconnect();
}
run();
