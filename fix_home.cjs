const fs = require('fs');
const path = './components/views/Home.tsx';
let content = fs.readFileSync(path, 'utf8');
const replacements = {
  '#d58f99': 'wade-accent',
  '#c07a84': 'wade-accent-hover',
  '#fff0f3': 'wade-accent-light',
  '#eae2e8': 'wade-border',
  '#f9f6f7': 'wade-bg-app',
  '#5a4a42': 'wade-text-main',
  '#917c71': 'wade-text-muted',
  '#ffb6c1': 'wade-accent/70'
};
for (const [hex, name] of Object.entries(replacements)) {
  const regex = new RegExp(`\\[${hex}\\]`, 'gi');
  content = content.replace(regex, name);
}
fs.writeFileSync(path, content);
