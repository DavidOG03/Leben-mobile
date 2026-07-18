const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      if (
        dirPath.endsWith('.tsx') || 
        dirPath.endsWith('.ts') || 
        dirPath.endsWith('.css') || 
        dirPath.endsWith('.js')
      ) {
        callback(dirPath);
      }
    }
  });
}

let fileCount = 0;

const directoriesToScan = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'tailwind.config.js')
];

directoriesToScan.forEach(target => {
  if (fs.statSync(target).isDirectory()) {
    walkDir(target, processFile);
  } else {
    processFile(target);
  }
});

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace variable names
  newContent = newContent.replace(/--accent-purple/g, '--accent-blue');
  // Update the actual hex colors in global.css
  if (filePath.endsWith('global.css')) {
    // Replace old purple hexes with vibrant blue
    newContent = newContent.replace(/#7c6af0/g, '#3b82f6');
    newContent = newContent.replace(/#9d8ff5/g, '#60a5fa');
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated purple to blue in ${filePath}`);
    fileCount++;
  }
}

console.log(`\nDone! Replaced purple with blue in ${fileCount} files.`);
