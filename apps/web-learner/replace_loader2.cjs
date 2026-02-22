const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
                callback(path.join(dir, f));
            }
        }
    });
}

let filesChanged = 0;
walkDir('/home/lain4504/SEP490/torii-monorepo/apps/web-learner/app', processFile);
walkDir('/home/lain4504/SEP490/torii-monorepo/apps/web-learner/components', processFile);

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    if (content.includes('Loader2')) {
        content = content.replace(/import\s+\{([^}]*?)\}\s+from\s+['"]lucide-react['"]/g, (match, p1) => {
            const imports = p1.split(',').map(s => s.trim()).filter(s => s && s !== 'Loader2');
            if (imports.length === 0) return '';
            return `import { ${imports.join(', ')} } from 'lucide-react'`;
        });

        content = content.replace(/<Loader2([^>]*?)>/g, '<Spinner$1>');
        content = content.replace(/<\/Loader2>/g, '</Spinner>');

        if (content !== originalContent && !content.includes('@workspace/ui/components/spinner')) {
            const importPattern = /^import.*?\n/gm;
            let lastMatch;
            let match;
            while ((match = importPattern.exec(content)) !== null) {
                lastMatch = match;
            }
            if (lastMatch) {
                const splitIndex = lastMatch.index + lastMatch[0].length;
                content = content.slice(0, splitIndex) + "import { Spinner } from '@workspace/ui/components/spinner'\n" + content.slice(splitIndex);
            } else {
                content = "import { Spinner } from '@workspace/ui/components/spinner'\n" + content;
            }
        }

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            filesChanged++;
        }
    }
}
console.log('Files changed:', filesChanged);
