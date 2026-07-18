const fs = require('fs');
const path = require('path');

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

walkDir(path.join(__dirname, 'src'), (filePath) => {
  // Skip the new Text.tsx component itself
  if (filePath.endsWith('Text.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Check if Text is imported from react-native
  if (/import\s+\{([^}]*)\bText\b([^}]*)\}\s+from\s+['"]react-native['"]/.test(content)) {
    // 1. Remove Text from react-native imports
    newContent = newContent.replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]react-native['"]/g,
      (match, inner) => {
        if (!/\bText\b/.test(inner)) return match;
        
        let newInner = inner.replace(/\bText\b/g, '')
                            .replace(/,\s*,/g, ',')
                            .replace(/{\s*,/g, '{')
                            .replace(/,\s*}/g, '}')
                            .trim();
        
        // If nothing is left in the import, just remove the whole import
        if (newInner === '{}' || newInner === '{ }') return '';
        return `import { ${newInner} } from 'react-native';`;
      }
    );

    // Clean up any double semicolons we might have made
    newContent = newContent.replace(/;;/g, ';');

    // 2. Add the custom Text import
    const customImport = `import { Text } from '@/components/ui/Text';\n`;
    
    // Find the last import to append after
    const importRegex = /^import\s+.*$/gm;
    let lastIndex = 0;
    let match;
    while ((match = importRegex.exec(newContent)) !== null) {
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex > 0) {
      newContent = newContent.slice(0, lastIndex) + '\n' + customImport + newContent.slice(lastIndex);
    } else {
      newContent = customImport + newContent;
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated imports in ${filePath}`);
    fileCount++;
  }
});

console.log(`\nDone! Updated Text imports in ${fileCount} files.`);
