const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  let listControlsRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4[^"]*">[\s\S]*?(<div className="flex items-center gap-2">\s*(?:<select[\s\S]*?<\/select>\s*<span[^>]*><\/span>\s*)?)([\s\S]*?)<\/div>\s*(?:<div className="w-full bg-white|<\/div>|<table)/;
  
  let match = listControlsRegex.exec(content);
  if (match) {
    let beforeButtons = match[1];
    let buttonsSection = match[2];

    if(buttonsSection.includes('<button') && !buttonsSection.includes('초기화')) { // ensuring it's not the search area button
      let btnMap = {};
      let regexBtn = /<button\b[\s\S]*?<\/button>/g;
      let btnMatch;
      while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
        let full = btnMatch[0];
        let textMatch = full.match(/>[\s\n]*([^<]+?)[\s\n]*<\/button>$/);
        let text = textMatch ? textMatch[1].trim() : '';
        if(!text && full.includes('등록')) text = '등록';
        if(!text && full.includes('엑셀')) text = '엑셀 다운로드';
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
      if (btnMap['사용자 등록']) {
        orderedButtons.push(btnMap['사용자 등록'].replace(/className="[^"]*"/, `className="h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-medium transition-colors shadow-sm"`));
        delete btnMap['사용자 등록'];
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

      // We need to also fix any corrupted <button onClick={() => ... } className="...">등록</button> from the previous run
      // In the previous run, "등록" might literally look like <button   onClick={() => ...} className="" >등록 ... wait, it was just appended.
      // Since orderedButtons contains the full string of each button, if my new regex picks up the broken `<button \n onClick={() => .. } className="..." >등록</button>` correctly, it WILL be processed correctly now.

      const newControls = match[0].replace(buttonsSection, "\n          " + orderedButtons.join('\n          ') + "\n        ");
      content = content.replace(match[0], newControls);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
