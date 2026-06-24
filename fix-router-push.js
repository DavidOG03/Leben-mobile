const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('C:/Users/DAVID/Desktop/Leben-mobile/src');
let updatedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content
    .replace(/router\.push\((['"`])([^'"`]+)\1\)/g, "router.push($1$2$1 as any)")
    .replace(/router\.replace\((['"`])([^'"`]+)\1\)/g, "router.replace($1$2$1 as any)");
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
    updatedCount++;
  }
});
console.log('Total files updated: ' + updatedCount);
