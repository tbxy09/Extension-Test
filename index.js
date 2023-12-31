const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const unzipper = require('unzipper');
const fs = require('fs'); // Make sure to add this as it's used in the script
const exec = require('util').promisify(require('child_process').exec);
const ExtensionTester = require('./extensionTester');

// Express server setup for handling uploads and serving the report
const app = express();
app.use(express.static('public'));

// Endpoint for uploading and initiating extension tests
app.post('/upload', upload.single('extension'), async (req, res) => {
  try {
    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: `uploads/unpacked/${req.file.filename}` }))
      .promise();

    const extensionPath = `uploads/unpacked/${req.file.filename}`;
    await exec(`cd ${extensionPath} && npm install && npm run build`);
    const tester = new ExtensionTester();
    const report = await tester.runTests(extensionPath);
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during the upload and test process.');
  }
});

// Endpoint for retrieving the test report
app.get('/report', (req, res) => {
  const reportPath = 'test-result.json';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf8');
    res.json(JSON.parse(report));
  } else {
    res.status(404).send('Test report not found.');
  }
});

app.listen(3000, () => {
  console.log('Extension Testing Service running on port 3000');
});
