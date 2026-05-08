const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 1. Convert standard full-width search structures
  // Example: <div className="bg-white border ... mb-8"><div className="flex flex-wrap ... gap-x-12 ...">
  content = content.replace(
    /(\n\s*)(?:\{?\/\*\s*Search Area\s*\*\/\s*\}?\n\s*)?<div className="(?:w-full )?(?:bg-white|bg-\[#F9FAFB\]|bg-gray-50)[^"]*mb-8[^"]*">\s*<div className="flex [^"]+gap-x-12[^"]*">/g,
    `$1{/* Search Area */}\n      <div className="flex items-stretch gap-3 mb-8">\n        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">`
  );

  // 1b. ExceptionManagement
  content = content.replace(
    /<div className="flex items-stretch gap-3 mb-8">\n\s*<div className="flex-1 bg-\[#eef1f5\][^"]*">/g,
    `<div className="flex items-stretch gap-3 mb-8">\n        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">`
  );

  // 1c. Replace button wrapper when it is a child of the flex flex-wrap container
  content = content.replace(
    /(?:<div className="(?:flex-1 )?flex justify-end[^\n]*">|\{?\/\*\s*Buttons\s*\*\/\s*\}?\n\s*<div className="flex justify-end[^\n]*">)(\s*)(<button[^>]*>[\s\S]*?초기화[\s\S]*?<\/button>\s*<button[^>]*>[\s\S]*?조회하기[\s\S]*?<\/button>\s*)<\/div>\s*<\/div>\s*<\/div>/g,
    `</div>\n        <div className="flex items-center gap-2 shrink-0">$1$2</div>\n      </div>`
  );
  
  // 1d. If already gap-2 but not inside flex items-stretch => we handled it with 1b or doesn't match.
  // Wait, ExceptionManagement is already formatted this way except the colors and button classes.

  // 2. Button Classes
  content = content.replace(
    /<button([^>]*)>\s*초기화\s*<\/button>/g,
    (match, attrs) => {
      let filteredAttrs = attrs.replace(/\bclassName="[^"]*"/g, '').trim();
      return `<button ${filteredAttrs} className="h-full px-8 bg-white border border-[#D1D6DB] text-[#4E5968] hover:bg-gray-50 rounded-md text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap">\n            초기화\n          </button>`;
    }
  );

  content = content.replace(
    /<button([^>]*)>\s*조회하기\s*<\/button>/g,
    (match, attrs) => {
      let filteredAttrs = attrs.replace(/\bclassName="[^"]*"/g, '').trim();
      return `<button ${filteredAttrs} className="h-full px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap">\n            조회하기\n          </button>`;
    }
  );

  // Fix: Button Group styling and Ordering
  // The user said: "버튼 그룹이 있을 경우 순서는 등록, 수정, 삭제, 엑셀 다운로드 순"
  // Example button group is after search area, typically in `<div className="flex items-center gap-2">` next to `<div className="text-[14px]">총...`
  // We need to parse that group.
  let listControlsRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4[^"]*">[\s\S]*?(<div className="flex items-center gap-2">\s*(?:<select[\s\S]*?<\/select>\s*<span[^>]*><\/span>\s*)?)([\s\S]*?)<\/div>\s*(?:<div className="w-full bg-white|<\/div>|<table)/;
  
  let match = listControlsRegex.exec(content);
  if (match) {
    let beforeButtons = match[1];
    let buttonsSection = match[2];

    if(buttonsSection.includes('<button') && !buttonsSection.includes('초기화')) { // ensuring it's not the search area button
      let btnMap = {};
      let regexBtn = /<button[^>]*>([\s\S]*?)<\/button>/g;
      let btnMatch;
      while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
        let text = btnMatch[1].trim();
        let full = btnMatch[0];
        btnMap[text] = full;
      }
      
      let orderedButtons = [];
      // 1. 등록
      if (btnMap['등록']) {
        orderedButtons.push(btnMap['등록'].replace(/className="[^"]*"/, `className="h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-medium transition-colors shadow-sm"`));
        delete btnMap['등록'];
      }
      if (btnMap['생성']) {
        orderedButtons.push(btnMap['생성'].replace(/className="[^"]*"/, `className="h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-medium transition-colors shadow-sm"`));
        delete btnMap['생성'];
      }
      
      // 2. 수정
      if (btnMap['수정']) {
        orderedButtons.push(btnMap['수정'].replace(/className="[^"]*"/, `className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"`));
        delete btnMap['수정'];
      }

      // 3. 삭제
      if (btnMap['삭제']) {
        orderedButtons.push(btnMap['삭제'].replace(/className="[^"]*"/, `className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"`));
        delete btnMap['삭제'];
      }
      
      // 4. 엑셀 다운로드
      if (btnMap['엑셀 다운로드']) {
        orderedButtons.push(btnMap['엑셀 다운로드'].replace(/className="[^"]*"/, `className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"`));
        delete btnMap['엑셀 다운로드'];
      }

      // 5. Rest
      for (const [key, val] of Object.entries(btnMap)) {
         orderedButtons.push(val.replace(/className="[^"]*"/, `className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"`));
      }

      const newControls = match[0].replace(buttonsSection, "\n          " + orderedButtons.join('\n          ') + "\n        ");
      content = content.replace(match[0], newControls);
    }
  }

  // Also replace button styling manually for other possible lists just in case
  content = content.replace(/className="[^"]*"\s*>(\s*)엑셀 다운로드/g, `className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">$1엑셀 다운로드`);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
