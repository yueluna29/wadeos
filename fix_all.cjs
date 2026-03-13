const fs = require('fs');
const path = require('path');

const dirs = ['./components/views/', './components/ui/'];
let files = [];

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const dirFiles = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
    files = files.concat(dirFiles);
  }
}

const replacements = {
  '#d58f99': 'wade-accent',
  '#c07a84': 'wade-accent-hover',
  '#fff0f3': 'wade-accent-light',
  '#eae2e8': 'wade-border',
  '#f9f6f7': 'wade-bg-app',
  '#fdfbfb': 'wade-bg-base',
  '#5a4a42': 'wade-text-main',
  '#917c71': 'wade-text-muted',
  '#7a665c': 'wade-text-muted', // slightly darker muted
  '#2d2d2d': 'wade-code-bg',
  '#a6accd': 'wade-code-text',
  '#e6aeb6': 'wade-border-light',
  '#ffb6c1': 'wade-accent/70',
  '#ff6b81': 'wade-accent',
  '#f8f6f6': 'wade-bg-app',
  '#fff5f7': 'wade-accent-light',
  '#fffafa': 'wade-bg-base',
  '#b06d77': 'wade-accent-hover'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [hex, name] of Object.entries(replacements)) {
    const regex = new RegExp(`\\[${hex}\\]`, 'gi');
    content = content.replace(regex, name);
  }
  fs.writeFileSync(file, content);
}
