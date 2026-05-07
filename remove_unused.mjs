import fs from 'fs';

let content = fs.readFileSync('components/SharedUI.tsx', 'utf-8');

function removeBlock(startStr, endStr) {
    const lines = content.split('\n');
    const start = lines.findIndex(l => l.includes(startStr));
    const end = lines.findIndex((l, i) => i > start && l.includes(endStr));
    if (start !== -1 && end !== -1) {
        lines.splice(start, end - start);
        content = lines.join('\n');
    }
}

removeBlock('// === Accordion Checkbox ===', '// === Accordion Option ===');
removeBlock('// === Accordion Option ===', '// === Survey Section ===');
removeBlock('// === Select Dropdown ===', '// === Signature Pad ===');
removeBlock('// === Warning Box ===', '// === Inline Warning ===');

fs.writeFileSync('components/SharedUI.tsx', content);
console.log('Removed unused components');
