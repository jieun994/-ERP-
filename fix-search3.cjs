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

    if(buttonsSection.includes('<button') && !buttonsSection.includes('초기화')) {
      let btnMap = {};
      let regexBtn = /<button\b[\s\S]*?<\/button>/g;
      let btnMatch;
      while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
        let full = btnMatch[0];
        // Match the content between the last > and </button>
        let textMatch = full.match(/>([^<>]+)<\/button>$/);
        let text = textMatch ? textMatch[1].trim() : '';
        if(!text) {
           if (full.includes('등록')) text = '등록';
           if (full.includes('생성')) text = '생성';
           if (full.includes('엑셀')) text = '엑셀 다운로드';
        }
        btnMap[text] = full;
      }
      
      let orderedButtons = [];
      const pushBtn = (text, cls) => {
         if(btnMap[text]) {
             let cleaned = btnMap[text].replace(/className="[^"]*"/, `className="${cls}"`);
             orderedButtons.push(cleaned);
             delete btnMap[text];
         }
      };

      const primaryClass = "h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-medium transition-colors shadow-sm";
      const secondaryClass = "h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm";

      pushBtn('등록', primaryClass);
      pushBtn('생성', primaryClass);
      pushBtn('사용자 등록', primaryClass);

      pushBtn('수정', secondaryClass);
      pushBtn('삭제', secondaryClass);
      pushBtn('엑셀 다운로드', secondaryClass.replace("px-4", "px-5"));

      // 5. Rest
      for (const [key, val] of Object.entries(btnMap)) {
         let cls = secondaryClass;
         if (key && key.includes('등록')) cls = primaryClass;
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
