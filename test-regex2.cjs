const fs = require('fs');
let content = fs.readFileSync('src/components/EnterpriseList.tsx', 'utf8');

let listControlsRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4[^"]*">[\s\S]*?(<div className="flex items-center gap-2">\s*(?:<select[\s\S]*?<\/select>\s*<span[^>]*><\/span>\s*)?)([\s\S]*?)<\/div>\s*(?:<div className="w-full bg-white|<\/div>|<table)/;
let match = listControlsRegex.exec(content);
if(match) {
   let buttonsSection = match[2];
   let regexBtn = /<button\b[\s\S]*?<\/button>/g;
   let btnMatch;
   while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
      let full = btnMatch[0];
      let textMatch = full.match(/>[\s\n]*([^<]+?)[\s\n]*<\/button>$/);
      let text = textMatch ? textMatch[1].trim() : '';
      if(!text && full.includes('등록')) text = '등록';
      console.log("Found text:", text, "for \n", full);
   }
}
