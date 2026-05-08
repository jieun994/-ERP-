const fs = require('fs');
let content = fs.readFileSync('src/components/EnterpriseList.tsx', 'utf8');

// I want to see what is currently there!
let listControlsRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4[^"]*">[\s\S]*?(<div className="flex items-center gap-2">\s*(?:<select[\s\S]*?<\/select>\s*<span[^>]*><\/span>\s*)?)([\s\S]*?)<\/div>\s*(?:<div className="w-full bg-white|<\/div>|<table)/;
let match = listControlsRegex.exec(content);
console.log(match ? "Matched!" : "No match");
if(match) {
   let buttonsSection = match[2];
   let regexBtn = /<button[^>]*>([\s\S]*?)<\/button>/g;
   let btnMatch;
   while ((btnMatch = regexBtn.exec(buttonsSection)) !== null) {
      console.log("Found text:", JSON.stringify(btnMatch[1].trim()));
   }
}
