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

  // We are looking for:
  //   {/* Search Area */}
  //   <div className="..."> ... </div>
  //   {/* Grid
  // But wait, it's easier to manually regex this.
  
  // Try to find the whole Search Area div block.
  // The Search Area block is typically `      {/* Search Area */}\n      <div ...>\n ... \n      </div>\n\n      {/* Grid Controls`
  // We can locate `<div className="flex-1 bg-[#eef1f5]` or similar.
  const regex = /\{\/\*\s*Search Area\s*\*\/\}\s*<div[^]*?(?:\{\/\*\s*Grid Controls|\{\/\*\s*List Area|<!-- Grid Controls|<!-- List Area|<div className="overflow-x-auto">|<div className="flex flex-col md:flex-row)/i;
  
  const match = content.match(regex);
  if (match) {
    let rawBlock = match[0];
    
    // Attempt to extract the "조회" (Search) onClick handler if present.
    let searchOnClick = "";
    let searchOnClickMatch = rawBlock.match(/<button[^>]*onClick=\{([^}]+)\}[^>]*>\s*조회/);
    if (!searchOnClickMatch) {
       searchOnClickMatch = rawBlock.match(/<button[^>]*onClick=\{([^}]+)\}[^>]*>\s*조회하기/);
    }
    if (searchOnClickMatch) {
      searchOnClick = ` onClick={${searchOnClickMatch[1]}}`;
    }

    // Attempt to extract the "초기화" (Reset) onClick handler if present.
    let resetOnClick = "";
    let resetOnClickMatch = rawBlock.match(/<button[^>]*onClick=\{([^}]+)\}[^>]*>\s*초기화/);
    if (resetOnClickMatch) {
      resetOnClick = ` onClick={${resetOnClickMatch[1]}}`;
    }

    // Now extract the internal fields inside the `bg-[#eef1f5]` container.
    // It is normally `<div className="flex-1 bg-[#eef1f5]...">(...)</div>`
    let fieldsInnerMatch = rawBlock.match(/<div[^>]*className="[^"]*bg-\[#eef1f5\][^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(button|\/div)/);
    // If not found, look for another div
    if (!fieldsInnerMatch) fieldsInnerMatch = rawBlock.match(/<div[^>]*className="[^"]*bg-\[#eef1f5\][^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
    if (!fieldsInnerMatch) fieldsInnerMatch = rawBlock.match(/<div[^>]*className="[^"]*bg-\[#eef1f5\][^"]*"[^>]*>([\s\S]*?)<\/div>(?:\s*<div|\s*<button)/);

    let fieldsInner = "";
    if (fieldsInnerMatch) {
      fieldsInner = fieldsInnerMatch[1];
    } else {
      console.log(`Could not find inner fields for ${file}`);
      // skip
    }

    if (fieldsInner) {
      // Build the new block
      let newBlock = `{/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#eef1f5] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4">
${fieldsInner.trimEnd()}
        </div>
        <button${resetOnClick} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-md text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap">
          초기화
        </button>
        <button${searchOnClick} className="bg-[#008d75] hover:bg-[#007a65] text-white px-10 py-5 rounded-md text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap">
          조회하기
        </button>
      </div>

      ${match[0].includes('Grid Controls') ? '{/* Grid Controls' : 
         match[0].includes('List Area') ? '{/* List Area' : 
         match[0].includes('<!--') ? '<!-- Grid' : 
         match[0].includes('overflow-x-auto') ? '<div className="overflow-x-auto">' :
         '<div className="flex flex-col md:flex-row'}`;

      if (match[0].includes('<div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-gray-900 mt-8">')) {
         newBlock = newBlock.replace('      <div className="flex flex-col md:flex-row', '      <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-gray-900 mt-8">');
      }

      content = content.replace(rawBlock, newBlock);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
