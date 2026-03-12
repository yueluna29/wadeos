const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/views/ChatInterface.tsx',
  'components/views/CouplesCounter.tsx',
  'components/views/Divination.tsx',
  'components/views/Home.tsx',
  'components/views/MemoryBank.tsx',
  'components/views/Memos.tsx',
  'components/views/PersonaTuning.tsx',
  'components/views/Settings.tsx',
  'components/views/SocialFeed.tsx',
  'components/views/TimeCapsulesView.tsx',
  'components/views/WadesPicksView.tsx',
  'components/layout/Shell.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace bg-white with bg-wade-bg-card
    content = content.replace(/bg-white(?![a-zA-Z0-9_-])/g, 'bg-wade-bg-card');
    
    // Replace bg-white/xx with bg-wade-bg-card/xx
    content = content.replace(/bg-white\/([0-9]+)/g, 'bg-wade-bg-card/$1');
    
    // Replace border-white with border-wade-bg-card
    content = content.replace(/border-white(?![a-zA-Z0-9_-])/g, 'border-wade-bg-card');
    
    // Replace border-t-white/xx with border-t-wade-bg-card/xx
    content = content.replace(/border-t-white\/([0-9]+)/g, 'border-t-wade-bg-card/$1');
    
    // Replace border-r-white/xx with border-r-wade-bg-card/xx
    content = content.replace(/border-r-white\/([0-9]+)/g, 'border-r-wade-bg-card/$1');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
