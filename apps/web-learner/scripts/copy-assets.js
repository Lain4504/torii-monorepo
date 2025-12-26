import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assignments = [
    {
        src: path.resolve(__dirname, '../node_modules/livekit-client/dist/livekit-client.e2ee.worker.js'),
        dest: path.resolve(__dirname, '../public/assets/livekit-client.e2ee.worker.js'),
    },
];

assignments.forEach(({ src, dest }) => {
    // Ensure directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied local node_modules: ${src} to ${dest}`);
    } else {
        // try checking root node_modules (monorepo root) if not found in local app node_modules
        // Current dir: apps/web-learner/scripts
        // Roots: ../../../node_modules
        // We use path.resolve for robustness across OS (Windows/Linux)
        const rootSrc = path.resolve(__dirname, '../../../node_modules/livekit-client/dist/livekit-client.e2ee.worker.js');

        if (fs.existsSync(rootSrc)) {
            fs.copyFileSync(rootSrc, dest);
            console.log(`Copied from root node_modules: ${rootSrc} to ${dest}`);
        } else {
            console.warn(`Source file not found in local or root node_modules: ${src}`);
        }
    }
});
