// Updated code with Extension Testing Service
const puppeteer = require('puppeteer');
const promisify = require('util').promisify;
const express = require('express');
const exec = promisify(require('child_process').exec);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const fs = require('fs');
const unzipper = require('unzipper');

// Removed debug and replaced with console.log
// find path to crhomium

class ExtensionTester {
  async runTests(extensionPath) {
    console.log('Running tests for extension at path:', extensionPath);
    const { stdout: chromiumPath } = await promisify(exec)("which chromium")
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox",
        "--disable-setuid-sandbox",
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ],
      executablePath: chromiumPath.trim()
    });
    // const browser = await puppeteer.launch({
    //   headless: false, // Change as needed
    //   args: [
    //     `--disable-extensions-except=${extensionPath}`,
    //     `--load-extension=${extensionPath}`
    //   ]
    // });
    const appPage = await browser.newPage();
    // TODO: Implement specific tests and report generation
    // Return test report
  }
}

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Combined Endpoint for uploading and testing extensions
app.post('/upload', upload.single('extension'), async (req, res) => {
  try {
    console.log('Uploading and unpacking extension:', req.file.filename);
    // Unzip and store in a directory
    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: `uploads/unpacked/${req.file.filename}` }))
      .promise();
    const extensionPath = `uploads/unpacked/${req.file.filename}`; // Path to the uploaded and unpacked extension
    console.log('Testing extension:', extensionPath);
    // Initiating test directly
    const tester = new ExtensionTester();
    const report = await tester.runTests(extensionPath);
    res.json({ report });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Failed to process the file.');
  }
});

// Endpoint for fetching the report
app.get('/report', (req, res) => {
  console.log('Fetching report');
  // TODO: Add logic to retrieve and send test report
  res.json({ report: 'This is your test report.' });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

module.exports = { ExtensionTester };
