const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to simulate a user uploading an extension
async function uploadExtension(extensionPath) {
  const formData = new FormData();
  formData.append('extension', fs.createReadStream(extensionPath));

  // Post the extension to the upload endpoint
  const response = await axios.post('http://localhost:3000/upload', formData, {
    headers: formData.getHeaders()
  });
  return response.data;
}

// Function to fetch a test report for a given session
async function fetchTestReport(sessionId) {
  const response = await axios.get(`http://localhost:3000/report/${sessionId}`);
  return response.data;
}

// Main function to run concurrent tests
async function runConcurrentTests() {
  // Paths to dummy extension files
  const extensions = [
    path.join(__dirname, 'dummyExtension1.zip'),
    path.join(__dirname, 'dummyExtension2.zip'),
    // Add more paths as needed
  ];

  // Running uploads concurrently
  const uploadPromises = extensions.map(uploadExtension);
  const uploadResults = await Promise.all(uploadPromises);

  // Fetching reports concurrently
  const reportPromises = uploadResults.map(result => fetchTestReport(result.sessionId));
  const reports = await Promise.all(reportPromises);

  // Log the results
  console.log('Upload Results:', uploadResults);
  console.log('Test Reports:', reports);
}

runConcurrentTests();