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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Fix onClick={() => {} -> onClick={() => {}}
  content = content.replace(/onClick=\{\(\) => \{\}/g, 'onClick={() => {}}');

  // Fix unterminated comments
  content = content.replace(/\{\/\* Grid Controls(\r|\n)/g, '{/* Grid Controls */}\n');
  content = content.replace(/\{\/\* List Area(\r|\n)/g, '{/* List Area */}\n');
  // if it had "<!-- Grid"
  content = content.replace(/<!-- Grid(\r|\n)/g, '<!-- Grid Controls -->\n');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed ${file}`);
  }
});
