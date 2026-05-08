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

  // Add missing '}' before className for buttons where we broke it
  content = content.replace(/\} className="bg-white border border-gray-300 text-gray-700/g, '}} className="bg-white border border-gray-300 text-gray-700');
  content = content.replace(/\} className="bg-\[#008d75\] hover:bg-\[#007a65\] text-white/g, '}} className="bg-[#008d75] hover:bg-[#007a65] text-white');

  // Also those three components missed the closing `</div>` because their `초기화` button has a space/indent issue OR it had `onClick={() => { ... }` that I just fixed.
  // We can just add the missing `</div>` for them too:
  content = content.replace(/(        <button[^>]*>\s*초기화)/g, '        </div>\n$1');

  // But we might double </div> if we run it again! We only want to replace if there's ONLY ONE </div> before the button?
  // Actually, wait, `add_missing_div.cjs` was already run on those that didn't have onClick that didn't match.
  // The reason they didn't match `/(        <button[^>]*>\s*초기화)/g` was maybe they had `onClick={...}` and the regex `[^>]*` didn't account for newlines or something. Wait, `[^>]*` matches inside the tag.
  // Oh, wait. `<button onClick={ () => { ... } className=` The `}` wasn't closed properly, so maybe `[^>]*` matched the whole file looking for `>` because `className` didn't have quotes? No, it did.
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
