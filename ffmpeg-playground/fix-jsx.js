const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../video-editor/app/playground/orchestration/[projectId]/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Find the line with </button> followed by )}
const pattern = /(\s+<\/button>\r?\n)(\s+)\)\}/;
const replacement = '$1$2  </>\r\n$2)}';

content = content.replace(pattern, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed JSX syntax error - added closing fragment tag');
