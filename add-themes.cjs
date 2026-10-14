const fs = require('fs');
const path = require('path');

const map = {
  'bg-slate-950': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-900': 'bg-white dark:bg-slate-900',
  'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
  'border-slate-800': 'border-slate-200 dark:border-slate-800',
  'border-slate-700': 'border-slate-300 dark:border-slate-700',
  'border-slate-900': 'border-slate-100 dark:border-slate-900',
  'text-slate-100': 'text-slate-900 dark:text-slate-100',
  'text-slate-200': 'text-slate-800 dark:text-slate-200',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-500',
  'text-white': 'text-slate-900 dark:text-white',
  'bg-sky-500/10': 'bg-sky-100 dark:bg-sky-500/10',
  'bg-sky-500/15': 'bg-sky-100 dark:bg-sky-500/15',
  'bg-emerald-500/10': 'bg-emerald-100 dark:bg-emerald-500/10',
  'bg-amber-500/10': 'bg-amber-100 dark:bg-amber-500/10',
};

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const stats = fs.statSync(dir);
  if (stats.isFile()) {
     processFile(dir);
     return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      processFile(full);
    }
  }
}

function processFile(full) {
  let content = fs.readFileSync(full, 'utf8');
  let changed = false;
  
  Object.entries(map).forEach(([dark, responsive]) => {
    const regex = new RegExp(`(?<!dark:)\\b${dark.replace(/\//g, '\\/')}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, responsive);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(full, content, 'utf8');
    console.log('Updated', full);
  }
}

processDir('d:/teamd/src/components');
processDir('d:/teamd/src/App.tsx');
