
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream('verification_result.txt', { flags: 'a' });
function log(msg) {
    console.log(msg);
    logStream.write(msg + '\n');
}

console.log('Starting verification...');
log('Starting verification...');

const SRC_DIR = path.join(__dirname, 'src');
log('Source dir: ' + SRC_DIR);

function getAllFiles(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                getAllFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
    } catch (e) {
        log('Error reading dir: ' + dir + ' ' + e);
    }
    return fileList;
}

const allFiles = getAllFiles(SRC_DIR);
log(`Found ${allFiles.length} files.`);

const fileMap = new Map();
allFiles.forEach(f => fileMap.set(f.toLowerCase(), f));

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.svg', '.png', '.jpg', '.jpeg'];

function checkFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        log('Error reading file: ' + filePath);
        return;
    }

    const importRegex = /import\s+(?:(?:[\w\s{},*]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;

    let match;
    const imports = [];
    while ((match = importRegex.exec(content)) !== null) {
        imports.push({ path: match[1], line: 0 }); 
    }
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push({ path: match[1], line: 0 });
    }

    imports.forEach(imp => {
        let resolvedPathBase;
        if (imp.path.startsWith('.')) {
            resolvedPathBase = path.resolve(path.dirname(filePath), imp.path);
        } else if (imp.path.startsWith('/')) {
            resolvedPathBase = path.join(SRC_DIR, imp.path);
        } else {
            return; 
        }

        let found = false;
        let actualPath = null;

        if (fileMap.has(resolvedPathBase.toLowerCase())) {
             found = true;
             actualPath = fileMap.get(resolvedPathBase.toLowerCase());
        } else {
            for (const ext of EXTENSIONS) {
                const withExt = resolvedPathBase + ext;
                if (fileMap.has(withExt.toLowerCase())) {
                    found = true;
                    actualPath = fileMap.get(withExt.toLowerCase());
                    break;
                }
            }
            if (!found) {
                 for (const ext of EXTENSIONS) {
                    const indexFile = path.join(resolvedPathBase, `index${ext}`);
                    if (fileMap.has(indexFile.toLowerCase())) {
                        found = true;
                        actualPath = fileMap.get(indexFile.toLowerCase());
                        break;
                    }
                }
            }
        }

        if (found) {
            const ext = path.extname(actualPath);
            const actualWithoutExt = actualPath.slice(0, -ext.length);
            const importExt = path.extname(resolvedPathBase);
            const expectedToCheck = importExt ? resolvedPathBase : resolvedPathBase;
            let targetActual = importExt ? actualPath : actualWithoutExt;
            
            if (path.basename(actualPath).startsWith('index.') && !resolvedPathBase.toLowerCase().endsWith('index')) {
                 targetActual = path.dirname(actualPath);
            }

            const nExpected = expectedToCheck.replace(/\\/g, '/');
            const nActual = targetActual.replace(/\\/g, '/');
            
            if (nExpected !== nActual) {
                log(`[CASE MISMATCH] File: ${path.relative(process.cwd(), filePath)}`);
                log(`  Import: ${imp.path}`);
                log(`  Expected: ...${nExpected.slice(-30)}`);
                log(`  Actual:   ...${nActual.slice(-30)}`);
            }
        } else {
            log(`[MISSING] File: ${path.relative(process.cwd(), filePath)}`);
            log(`  Import: ${imp.path}`);
        }
    });
}

const jsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
log(`Checking ${jsFiles.length} JS/JSX files...`);
jsFiles.forEach(checkFile);
log('Done.');
