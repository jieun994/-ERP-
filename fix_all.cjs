const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const searchButtonsRegex = /<div className="[^"]*?(?:flex-col|flex items-center)[^"]*?gap-[^"]*?(?:shrink-0)?(?: justify-end)?">\s*<button([^>]*)>[\s\S]*?초기화[\s\S]*?<\/button>\s*<button([^>]*)>[\s\S]*?조회하기(?:[\s\S]*?)<\/button>\s*<\/div>/g;

  content = content.replace(searchButtonsRegex, (match, btnAttrs1, btnAttrs2) => {
    // Preserve the original button tags entirely, just match the className attributes within them.
    // Instead of regex on the whole block, lets use a more precise regex.
  });

  // A better regex for buttons inside Search Area
  // Let's replace button classNames directly instead.
  
  if (content.includes('초기화') && content.includes('조회하기') && !file.includes('ExceptionManagement')) {
      // Just replacing className inside <div className="flex items-center gap-2 shrink-0"> ... 
      // where we know the buttons are.
      
      const searchBoxRegex = /<div className="flex items-(?:stretch|center|end) gap-2(?: shrink-0)?(?: justify-end)?">\s*<button\s+([^>]*?)>([\s\S]*?초기화[\s\S]*?)<\/button>\s*<button\s+([^>]*?)>([\s\S]*?조회하기[\s\S]*?)<\/button>\s*<\/div>/g;

      content = content.replace(searchBoxRegex, (match, p1, p2, p3, p4) => {
         let btn1Clean = p1.replace(/\bclassName="[^"]*"/g, '').trim();
         let btn2Clean = p3.replace(/\bclassName="[^"]*"/g, '').trim();

         // Fix ExceptionManagement has specific onClick, so we keep `btn1Clean` which contains it.
         return `<div className="flex items-center gap-2 shrink-0">\n            <button ${btn1Clean} className="h-[40px] px-8 bg-white border border-[#D1D6DB] text-[#4E5968] hover:bg-gray-50 rounded-md text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">\n              ${p2.trim()}\n            </button>\n            <button ${btn2Clean} className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">\n              ${p4.trim()}\n            </button>\n          </div>`;
      });
      
      // FirmBankingFailureStatus uses flex flex-col for button wrappers, catching that:
      const searchBoxColRegex = /<div className="flex flex-col gap-2 shrink-0 justify-end">\s*<button\s+([^>]*?)>([\s\S]*?초기화[\s\S]*?)<\/button>\s*<button\s+([^>]*?)>([\s\S]*?조회하기[\s\S]*?)<\/button>\s*<\/div>/g;

      content = content.replace(searchBoxColRegex, (match, p1, p2, p3, p4) => {
         let btn1Clean = p1.replace(/\bclassName="[^"]*"/g, '').trim();
         let btn2Clean = p3.replace(/\bclassName="[^"]*"/g, '').trim();

         return `<div className="flex items-center gap-2 shrink-0">\n            <button ${btn1Clean} className="h-[40px] px-8 bg-white border border-[#D1D6DB] text-[#4E5968] hover:bg-gray-50 rounded-md text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">\n              ${p2.trim()}\n            </button>\n            <button ${btn2Clean} className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">\n              ${p4.trim()}\n            </button>\n          </div>`;
      });
  }

  // Handle ExceptionManagement manually or dynamically if needed (skip logic above covers most, let's include ExceptionManagement)
  if (file.includes('ExceptionManagement')) {
      content = content.replace(/className="h-full px-8 bg-white border border-gray-300 text-gray-700/g, 'className="h-[40px] px-8 bg-white border border-[#D1D6DB] text-[#4E5968]');
      content = content.replace(/className="h-full px-10 bg-\[#008d75\]/g, 'className="h-[40px] px-10 bg-[#008d75]');
  }


  // Rule 3 & 4: Button Group ordering & Height
  let listControlsRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4[^"]*">[\s\S]*?(<div className="flex items-center gap-2">\s*(?:<select[\s\S]*?<\/select>\s*<span[^>]*><\/span>\s*)?)([\s\S]*?)<\/div>\s*(?:<div className="w-full bg-white|<\/div>|<table)/;
  
  let match = listControlsRegex.exec(content);
  if (match) {
    let beforeButtons = match[1];
    let buttonsSection = match[2];

    if(buttonsSection.includes('<button') && !buttonsSection.includes('초기화')) {
      let btnMap = {};
      let regexBtn = /<button\b[\s\S]*?<\/button>/g;
      let btnMatch;
      while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
        let full = btnMatch[0];
        let textMatch = full.match(/>([^<>]+)<\/button>$/);
        let text = textMatch ? textMatch[1].trim() : '';
        if(!text) {
           if (full.includes('등록')) text = '등록';
           else if (full.includes('생성')) text = '생성';
           else if (full.includes('엑셀')) text = '엑셀 다운로드';
           else if (full.includes('조회하기')) text = '조회하기';
           else text = 'NO_TXT_' + Math.random();
        }
        btnMap[text] = full;
      }
      
      let orderedButtons = [];
      const pushBtn = (keys, cls) => {
         const keyArr = Array.isArray(keys) ? keys : [keys];
         for (const key of keyArr) {
             const foundKey = Object.keys(btnMap).find(k => k.includes(key));
             if(foundKey && btnMap[foundKey]) {
                 let cleaned = btnMap[foundKey].replace(/className="[^"]*"/, `className="${cls}"`);
                 orderedButtons.push(cleaned);
                 delete btnMap[foundKey];
             }
         }
      };

      const primaryClass = "h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-bold transition-colors shadow-sm";
      const secondaryClass = "h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm";
      const excelClass = "h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm";

      // 1. 노출여부 변경 / 사용여부 변경
      pushBtn(['노출여부 변경', '사용여부 변경'], secondaryClass);

      // 2. 등록
      pushBtn(['등록', '생성'], primaryClass);

      // 3. 수정
      pushBtn('수정', secondaryClass);

      // 4. 삭제
      pushBtn('삭제', secondaryClass);

      // 5. 엑셀 다운로드
      pushBtn('엑셀', excelClass);

      // 6. Rest
      for (const [key, val] of Object.entries(btnMap)) {
         let cls = secondaryClass;
         if (key && (key.includes('등록') || key.includes('추가'))) cls = primaryClass;
         orderedButtons.push(val.replace(/className="[^"]*"/, `className="${cls}"`));
      }

      const newControls = match[0].replace(buttonsSection, "\n          " + orderedButtons.join('\n          ') + "\n        ");
      content = content.replace(match[0], newControls);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
