const fs = require('fs');
const path = require('path');

const files = [
    'components/FormSteps.tsx',
    'components/ComplexSections.tsx',
    'components/SharedUI.tsx'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/text-\[1\.5rem\] md:text-\[1\.75rem\]/g, 'dynamic-text-h2');
        content = content.replace(/text-\[1\.75rem\] md:text-\[2rem\]/g, 'dynamic-text-h1');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
