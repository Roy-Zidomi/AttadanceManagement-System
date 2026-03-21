const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { search: /(?<!dark:)bg-white/g, replace: 'bg-white dark:bg-slate-900' },
  { search: /(?<!dark:)bg-slate-50/g, replace: 'bg-slate-50 dark:bg-[#0B0F19]' },
  { search: /(?<!dark:)bg-slate-100/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { search: /(?<!dark:)bg-slate-200/g, replace: 'bg-slate-200 dark:bg-slate-700' },
  // Foreground/Text
  { search: /(?<!dark:)text-slate-900/g, replace: 'text-slate-900 dark:text-slate-100' },
  { search: /(?<!dark:)text-slate-800/g, replace: 'text-slate-800 dark:text-slate-200' },
  { search: /(?<!dark:)text-slate-700/g, replace: 'text-slate-700 dark:text-slate-300' },
  { search: /(?<!dark:)text-slate-600/g, replace: 'text-slate-600 dark:text-slate-400' },
  { search: /(?<!dark:)text-slate-500/g, replace: 'text-slate-500 dark:text-slate-400' },
  // Borders
  { search: /(?<!dark:)border-slate-300/g, replace: 'border-slate-300 dark:border-slate-700' },
  { search: /(?<!dark:)border-slate-200/g, replace: 'border-slate-200 dark:border-slate-800' },
  { search: /(?<!dark:)border-slate-100/g, replace: 'border-slate-100 dark:border-slate-800' },
  // Indigo (Primary semantic) adjustments for dark mode
  { search: /(?<!dark:)bg-indigo-50/g, replace: 'bg-indigo-50 dark:bg-indigo-900\/20' },
  { search: /(?<!dark:)bg-indigo-100/g, replace: 'bg-indigo-100 dark:bg-indigo-900\/40' },
  { search: /(?<!dark:)text-indigo-700/g, replace: 'text-indigo-700 dark:text-indigo-400' },
  { search: /(?<!dark:)text-indigo-800/g, replace: 'text-indigo-800 dark:text-indigo-300' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const {search, replace} of replacements) {
        content = content.replace(search, replace);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

try {
  processDir(path.join(__dirname, 'src/app'));
  processDir(path.join(__dirname, 'src/components'));
  console.log('Successfully injected dark mode tailwind classes!');
} catch (err) {
  console.error(err);
}
