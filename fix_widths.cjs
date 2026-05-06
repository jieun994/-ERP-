const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

let files = getAllFiles('src/components');
files.push('src/Dashboard.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;
  
  // Unify wrapper widths
  content = content.replace(/max-w-\[1400px\] mx-auto/g, 'w-full');
  content = content.replace(/max-w-7xl mx-auto/g, 'w-full');
  
  // Make tables scrollable by preventing them from shrinking text
  content = content.replace(/<table className="([^"]+)"/g, (match, classes) => {
    let newClasses = classes;
    if (!newClasses.includes('whitespace-nowrap')) {
      newClasses += ' whitespace-nowrap';
    }
    return `<table className="${newClasses}"`;
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
