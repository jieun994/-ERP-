const fs = require('fs');

const files = fs.readdirSync('src/components').map(f => 'src/components/' + f).filter(f => f.endsWith('.tsx'));
files.push('src/Dashboard.tsx');
files.push('src/App.tsx');
files.push('src/components/register/Step1.tsx');
files.push('src/components/register/Step2.tsx');
files.push('src/components/register/Step3.tsx');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. 선택 삭제 -> 삭제
  content = content.replace(/>\s*선택 삭제\s*</g, () => {
    changed = true;
    return '>삭제<';
  });

  // 2. 신규 등록 -> 등록
  content = content.replace(/>\s*신규 등록\s*</g, () => {
    changed = true;
    return '>등록<';
  });

  // 3. 관리자 등록 -> 등록 (maybe?) Only if it's "신규 등록". User said "버튼명 신규 등록인 화면에서 버튼명 등록으로 전체 수정". So only "신규 등록" exactly.
  
  // 4. 아이콘 삭제
  let newContent = content.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (match, attrs, innerText) => {
    let replacedInner = innerText.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '');
    replacedInner = replacedInner.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*><\/[A-Z][A-Za-z0-9]*>/g, '');
    return `<button${attrs}>${replacedInner}</button>`;
  });
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
