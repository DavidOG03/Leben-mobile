const fs = require('fs');
const path = require('path');

const mappings = {
  // Backgrounds
  'bg-[#0a0a0a]': 'bg-leben-bg',
  'bg-[#161616]': 'bg-leben-bg-card',
  'bg-[#141414]': 'bg-leben-bg-card',
  'bg-[#131313]': 'bg-leben-bg-card',
  'bg-[#111]': 'bg-leben-bg-card',
  'bg-[#1a1a1a]': 'bg-leben-bg-secondary',
  'bg-[#181818]': 'bg-leben-bg-secondary',
  'bg-[#212225]': 'bg-leben-bg-element',
  'bg-[#222]': 'bg-leben-bg-element',
  'bg-[#222222]': 'bg-leben-bg-element',
  'bg-[#7c6af0]': 'bg-leben-accent',

  // Borders
  'border-[#222222]': 'border-leben-border',
  'border-[#222]': 'border-leben-border',
  'border-[#1a1a1a]': 'border-leben-border-subtle',
  'border-[#181818]': 'border-leben-border-subtle',
  'border-[#1e1e1e]': 'border-leben-border',
  'border-[#2a2a2a]': 'border-leben-border',
  'border-[#333]': 'border-leben-border',
  'border-[#3a3a9e]': 'border-leben-accent',
  'border-[#7c6af0]': 'border-leben-accent',
  'border-[#555]': 'border-leben-border',

  // Text
  'text-[#f0f0f0]': 'text-leben-text',
  'text-[#ffffff]': 'text-leben-text',
  'text-[#fff]': 'text-leben-text',
  'text-[#acacac]': 'text-leben-text-2',
  'text-[#ccc]': 'text-leben-text-2',
  'text-[#aaa]': 'text-leben-text-2',
  'text-[#999]': 'text-leben-text-muted',
  'text-[#888]': 'text-leben-text-muted',
  'text-[#888888]': 'text-leben-text-muted',
  'text-[#666]': 'text-leben-text-dim',
  'text-[#555]': 'text-leben-text-muted',
  'text-[#444]': 'text-leben-text-dim',
  'text-[#333]': 'text-leben-text-dim',
  'text-[#2a2a2a]': 'text-leben-text-dim',
  'text-[#7c6af0]': 'text-leben-accent',
  'text-[#9d8ff5]': 'text-leben-accent-light',
  'text-[#4caf7d]': 'text-leben-success',
  'text-[#4caf70]': 'text-leben-success',
  'text-[#ef4444]': 'text-leben-error',
  'text-[#f87171]': 'text-leben-error',
  'text-[#f59e0b]': 'text-prio-medium',
  'text-[#e0e0e0]': 'text-leben-text'
};

const styleMappings = {
  "'#0a0a0a'": "'var(--bg-primary)'",
  "'#161616'": "'var(--bg-card)'",
  "'#141414'": "'var(--bg-card)'",
  "'#131313'": "'var(--bg-card)'",
  "'#111'": "'var(--bg-card)'",
  "'#1a1a1a'": "'var(--bg-secondary)'",
  "'#181818'": "'var(--bg-secondary)'",
  "'#212225'": "'var(--bg-element)'",
  "'#222'": "'var(--border-primary)'",
  "'#222222'": "'var(--border-primary)'",
  "'#1e1e1e'": "'var(--border-primary)'",
  "'#2a2a2a'": "'var(--border-primary)'",
  "'#333'": "'var(--border-primary)'",
  "'#f0f0f0'": "'var(--text-primary)'",
  "'#fff'": "'var(--text-primary)'",
  "'#ffffff'": "'var(--text-primary)'",
  "'#acacac'": "'var(--text-secondary)'",
  "'#ccc'": "'var(--text-secondary)'",
  "'#aaa'": "'var(--text-secondary)'",
  "'#999'": "'var(--text-muted)'",
  "'#888'": "'var(--text-muted)'",
  "'#666'": "'var(--text-dim)'",
  "'#555'": "'var(--text-muted)'",
  "'#444'": "'var(--text-dim)'",
  "'#7c6af0'": "'var(--accent-purple)'",
  "'#9d8ff5'": "'var(--accent-purple-light)'"
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

let fileCount = 0;
let replacedCount = 0;

walkDir(path.join(__dirname, 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let modified = false;

  // Replace class mappings
  Object.keys(mappings).forEach(hexClass => {
    if (newContent.includes(hexClass)) {
      // Create a global regex safely escaping brackets
      const safeClass = hexClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const regex = new RegExp(safeClass, 'g');
      const matches = (newContent.match(regex) || []).length;
      if (matches > 0) {
        newContent = newContent.replace(regex, mappings[hexClass]);
        replacedCount += matches;
        modified = true;
      }
    }
  });

  // Replace inline style hexes
  Object.keys(styleMappings).forEach(hexStyle => {
    if (newContent.includes(hexStyle)) {
      const regex = new RegExp(hexStyle, 'g');
      const matches = (newContent.match(regex) || []).length;
      if (matches > 0) {
        newContent = newContent.replace(regex, styleMappings[hexStyle]);
        replacedCount += matches;
        modified = true;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated hex values in ${filePath}`);
    fileCount++;
  }
});

console.log(`\nDone! Replaced ${replacedCount} hardcoded hex values in ${fileCount} files.`);
