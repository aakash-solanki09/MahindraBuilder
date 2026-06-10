const mongoose = require('mongoose');
const { Page } = require('./models/Page');

async function getPublishedPaths() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mahindra-builder');
    const page = await Page.findOne({ published: true });
    if (!page) {
      console.log('No published page found');
      return;
    }
    
    const paths = [];
    function findImages(obj) {
      for (let key in obj) {
        if (typeof obj[key] === 'string' && (obj[key].includes('/uploads/') || obj[key].includes('/assets/'))) {
          paths.push({ key, path: obj[key] });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          findImages(obj[key]);
        }
      }
    }
    
    findImages(page.toObject());
    console.log(JSON.stringify(paths, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getPublishedPaths();
