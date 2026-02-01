const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, 'src', 'app', 'api');
const aiFlowsDir = path.join(__dirname, 'src', 'ai', 'flows');
const mocksDir = path.join(__dirname, 'src', 'ai', 'mobile-mocks');

const MOVED_FILES = [];

// Helper to recursively find file paths
function getAllRouteFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllRouteFiles(filePath, fileList);
        } else {
            if (file === 'route.ts' || file === 'route.js') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// Rename files with retry logic
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renameFile(source, target) {
    if (fs.existsSync(source)) {
        try {
            fs.renameSync(source, target);
            console.log(`Renamed: ${path.basename(source)} -> ${path.basename(target)}`);
            return true;
        } catch (e) {
            console.error(`Failed to rename ${source}:`, e.message);
            return false;
        }
    }
    return false;
}

// Main logic
async function main() {
    try {
        // 1. Hide API Routes
        console.log('--- Phase 1: Hiding API routes ---');
        const routes = getAllRouteFiles(apiDir);
        for (const route of routes) {
            const backup = `${route}.bak`;
            if (await renameFile(route, backup)) {
                MOVED_FILES.push({ original: route, backup: backup });
            }
        }

        // 2. Swap AI Flows with Mocks
        console.log('--- Phase 2: Swapping AI Flows with Mocks ---');
        if (fs.existsSync(mocksDir)) {
            const mockFiles = fs.readdirSync(mocksDir);
            for (const file of mockFiles) {
                const originalPath = path.join(aiFlowsDir, file);
                const mockPath = path.join(mocksDir, file);
                const backupPath = `${originalPath}.server`; // daily-briefing.ts.server

                // If the original flow exists, back it up and copy mock in its place
                if (fs.existsSync(originalPath)) {
                    // Rename original -> original.server
                    if (await renameFile(originalPath, backupPath)) {
                        MOVED_FILES.push({ original: originalPath, backup: backupPath });

                        // Copy mock -> original
                        fs.copyFileSync(mockPath, originalPath);
                        console.log(`Mocked: ${file}`);
                        // Track this copy so we define how to cleanup? 
                        // Actually cleanup is just restoring the backup, which overwrites the mock.
                    }
                }
            }
        }

        // 3. Run Build
        console.log('--- Phase 3: Running Build ---');
        execSync('cross-env IS_MOBILE=true npm run build', { stdio: 'inherit' });
        console.log('Build completed successfully.');

    } catch (error) {
        console.error('Build failed!', error.message);
        process.exitCode = 1;
    } finally {
        console.log('--- Phase 4: Restoring Files ---');
        // Restore in reverse order
        for (const moved of MOVED_FILES.reverse()) {
            if (fs.existsSync(moved.backup)) {
                // If it was a swap (AI flow), this rename overwrites the mock we copied.
                try {
                    // Delete the mock file first if it exists to avoid specific permission issues on some OS
                    if (moved.original.includes('ai') && fs.existsSync(moved.original)) {
                        fs.unlinkSync(moved.original);
                    }
                    fs.renameSync(moved.backup, moved.original);
                    console.log(`Restored: ${path.basename(moved.original)}`);
                } catch (e) {
                    console.error(`Failed to restore ${moved.original}:`, e.message);
                }
            }
        }
    }
}

main();
