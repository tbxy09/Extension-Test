const express = require('express');
const multer = require('multer');
const fs = require('fs');
const unzipper = require('unzipper');
const exec = require('util').promisify(require('child_process').exec);
const { v4: uuidv4 } = require('uuid');
const ExtensionTester = require('./extensionTester');

// Express server setup for handling uploads and serving the report
const app = express();
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

// Endpoint for uploading and initiating extension tests
app.post('/upload', upload.single('extension'), async (req, res) => {
  try {
    const sessionId = uuidv4();
    const sessionPath = `uploads/unpacked/${sessionId}`;
    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: sessionPath }))
      .promise();
    const extensionPath = `${sessionPath}/${req.file.filename}`;
    await exec(`cd ${extensionPath} && npm install && npm run build`);
    const tester = new ExtensionTester();
    const report = await tester.runTests(extensionPath);
    res.json({ report, sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during the upload and test process.');
  }
});

// Endpoint for retrieving the test report
app.get('/report/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const reportPath = `uploads/unpacked/${sessionId}/test-result.json`;
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
