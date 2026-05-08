const fs = require('fs');

const files = [
  'src/components/AdminManagement.tsx',
  'src/components/CodeManagement.tsx',
  'src/components/EnterpriseList.tsx',
  'src/components/MessageManagement.tsx',
  'src/components/ServiceStatus.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const target = `          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">`;
        
  const replacement = `        </div>
        <div className="flex flex-col gap-2 shrink-0">`;
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  } else {
    // Try regex
    const regex = /<\/div>\s*<\/div>\s+<div className="flex flex-col gap-2 shrink-0">/;
    if (regex.test(content)) {
       content = content.replace(regex, `</div>\n        <div className="flex flex-col gap-2 shrink-0">`);
       fs.writeFileSync(file, content, 'utf8');
       console.log(`Fixed ${file} with regex`);
    } else {
       console.log(`Not found in ${file}`);
    }
  }
}
