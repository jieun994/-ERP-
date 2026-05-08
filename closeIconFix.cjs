const fs = require('fs');

const files = fs.readdirSync('src/components').map(f => 'src/components/' + f).filter(f => f.endsWith('.tsx'));
files.push('src/components/MenuManagement.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Find empty buttons and add "X" text if they seem to be close buttons
  let newContent = content.replace(/<button([^>]*)>\s*<\/button>/g, (match, attrs) => {
    // If it has onClick={...close...} or onClose... or className includes 'rounded-full' or 'hover:text-gray-700'
    return `<button${attrs}>X</button>`;
  });
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated empty button to X in ${file}`);
  }
}
