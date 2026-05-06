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

  // Find occurrences of multiple `</div>` before the `<button ...> 초기화`
  // We want to replace any sequence of `</div>` and whitespace that immediately precedes the button with a single `</div>\n        <button...`
  const regex = /(?:\s*<\/div>)+\s*(<button[^>]*>\s*초기화)/g;
  content = content.replace(regex, '\n        </div>\n        $1');

  // Let's also check for `{/* Grid Controls` without `*/}`
  content = content.replace(/\{\/\* Grid Controls\n/g, '{/* Grid Controls */}\n');
  content = content.replace(/\{\/\* List Area\n/g, '{/* List Area */}\n');

  // Also check if any button has `onClick={() => { ... } className=`
  // We missed any cases where the space or whatever was different
  content = content.replace(/\}[ \n\r]*className="bg-white border/g, '}} className="bg-white border');
  content = content.replace(/\}[ \n\r]*className="bg-\[#008d75\]/g, '}} className="bg-[#008d75]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Cleaned ${file}`);
  }
});
