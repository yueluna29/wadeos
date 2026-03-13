const fs = require('fs');
const path = './components/views/ChatInterface.tsx';
let content = fs.readFileSync(path, 'utf8');
const replacements = {
  '#d58f99': 'wade-accent',
  '#c07a84': 'wade-accent-hover',
  '#fff0f3': 'wade-accent-light',
  '#eae2e8': 'wade-border',
  '#f9f6f7': 'wade-bg-app',
  '#fdfbfb': 'wade-bg-base',
  '#5a4a42': 'wade-text-main',
  '#917c71': 'wade-text-muted',
  '#2d2d2d': 'wade-code-bg',
  '#a6accd': 'wade-code-text',
  '#e6aeb6': 'wade-border-light'
};
for (const [hex, name] of Object.entries(replacements)) {
  const regex = new RegExp(`\\[${hex}\\]`, 'gi');
  content = content.replace(regex, name);
}
content = content.replace(/backgroundColor:\s*'rgba\\(213,\s*143,\s*153,\s*0\\.35\\)'/g, "backgroundColor: 'rgba(var(--wade-accent-rgb), 0.35)'");
fs.writeFileSync(path, content);
