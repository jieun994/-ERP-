const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = [];
walkDir('src/components', function(filePath) {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/<\/div>\s*undefined\s*<\/div>/g, '</div>\n      </div>');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            modifiedFiles.push(filePath);
        }
    }
});

console.log('Fixed undefined in:', modifiedFiles.join(', '));
