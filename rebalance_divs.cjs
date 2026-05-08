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

  // We know the unclosed div is right inside the Search Area, which breaks the main div.
  // Let's count `<div` vs `</div`
  const divOpenCount = (content.match(/<div(>|\s[^>]*>)/g) || []).length;
  const divCloseCount = (content.match(/<\/div>/g) || []).length;
  
  if (divOpenCount > divCloseCount) {
    let diff = divOpenCount - divCloseCount;
    // We append the missing `</div>`s right before `</div>\n        <button className="bg-white border ... 초기화`
    // Because that's where the flex inner fields ended up unclosed
    let missingDivs = '\n' + '          </div>'.repeat(diff) + '\n';
    
    // Inject the missing divs before the closing of `bg-[#eef1f5]`
    content = content.replace(/(        <\/div>\n\s*<button[^>]*>\s*초기화)/, missingDivs + '$1');
  } else if (divCloseCount > divOpenCount) {
    // Delete excess divs
    let diff = divCloseCount - divOpenCount;
    for(let i=0; i<diff; i++) {
        content = content.replace(/\s*<\/div>\n(\s*<button[^>]*>\s*초기화)/, '\n$1');
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Rebalanced ${file}: Added ${divOpenCount - divCloseCount} divs`);
  }
});
