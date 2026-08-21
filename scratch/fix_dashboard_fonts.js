const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/DAVID/Desktop/Leben-mobile/src/components/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add font-geist-medium to <Text className="..."> that lack font-
  content = content.replace(/<Text([^>]*?)className=[\"'](.*?)[\"']/g, (match, before, classNames) => {
    if (!classNames.includes('font-')) {
      return `<Text${before}className="${classNames} font-geist-medium"`;
    }
    return match;
  });

  // For <Text> with no className at all, we add className="font-geist-medium"
  // We match <Text followed by > or space and no className inside
  content = content.replace(/<Text(\s*[^>]*?)>/g, (match, attrs) => {
     if (attrs.includes('className=')) return match;
     // don't match <TextInput> or something
     if (match.startsWith('<TextInput')) return match; 
     return `<Text${attrs} className="font-geist-medium">`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
}
