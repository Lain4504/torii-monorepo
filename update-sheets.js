const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix 1: Width override
            const newContent = content.replace(/className="w-full sm:max-w-\[800px\]/g, 'className="!w-full sm:!max-w-[800px]');
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
            
            // Also sm:w-[800px] if existing
            const newContent2 = content.replace(/className="w-full sm:w-\[800px\]/g, 'className="!w-full sm:!w-[800px]');
            if (newContent2 !== content) {
                content = newContent2;
                modified = true;
            }

            // Fix 2: min-h-0 padding for flex columns correctly handling scrolling
            const formRegex = /(<(?:form|div|ScrollArea)[^>]+className="[^"]*\bflex-1\b[^"]*)(")/g;
            const contentAfterFlex1 = content.replace(formRegex, (match, prefix, suffix) => {
                if (prefix.includes('min-h-0')) return match;
                return prefix + ' min-h-0' + suffix;
            });
            if (contentAfterFlex1 !== content) {
                content = contentAfterFlex1;
                modified = true;
            }

            if (modified) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

replaceInDir('./apps/web-admin/src/components');
console.log('Done');
