const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const buttonsHTML = `        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm">
            초기화
          </button>
        </div>
      </div>`;

let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  if (fs.statSync(filePath).isFile()) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('{/* Search Area */}')) {
      if (!content.includes('조회\n          </button>')) {
        const areaMatch = content.match(/({\/\*\s*Search Area\s*\*\/}[\s\S]*?className="flex items-stretch gap-3 mb-[^"]*"[\s\S]*?)(\n\s*<\/div>\s*<\/div>\s*)\n\s*(?:{\/\*|<\w+|<!--)/);
        
        if (areaMatch) {
          const replacement = areaMatch[1] + '\n' + buttonsHTML + '\n\n';
          const newContent = content.replace(areaMatch[0], replacement + areaMatch[0].substring(areaMatch[1].length + areaMatch[2].length));
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`Fixed ${file}`);
          fixedCount++;
        } else {
          console.log(`Could not automatically fix ${file}, pattern not matched exactly.`);
        }
      }
    }
  }
}
console.log(`Fixed ${fixedCount} files`);
