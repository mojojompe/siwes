const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  // Replace #3B5BDB with #6CAADE (case-insensitive)
  newContent = newContent.replace(/#3B5BDB/gi, '#6CAADE');
  // Replace rgb(59,91,219) with rgb(108,170,222) if any
  newContent = newContent.replace(/59,\s*91,\s*219/g, '108,170,222');
  
  // Replace #3451C9 with #4A8CC0 (case-insensitive)
  newContent = newContent.replace(/#3451C9/gi, '#4A8CC0');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx') || dirFile.endsWith('.css')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(targetDir);
files.forEach(replaceInFile);
console.log('Done replacing colors.');
