import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const distDir = path.join(__dirname, '../dist');
const releaseDir = path.join(__dirname, '../release');
const outputFilename = `pdf-extension-v${version}.zip`;
const outputPath = path.join(releaseDir, outputFilename);

// Ensure dist exists
if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
}

// Ensure release dir exists
if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// Listen for all archive data to be written
output.on('close', function () {
    console.log(`${outputFilename} created successfully (${archive.pointer()} bytes)`);
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        // log warning
        console.warn(err);
    } else {
        // throw error
        throw err;
    }
});

// good practice to catch this error explicitly
archive.on('error', function (err) {
    throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
// using glob patterns to append files
archive.glob('**/*', {
    cwd: distDir,
    ignore: ['**/Thumbs.db', '**/.DS_Store'] // generic ignore
}, {});

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
