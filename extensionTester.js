const puppeteer = require('puppeteer');
const fs = require('fs');
const exec = require('util').promisify(require('child_process').exec);

// Setting up the ExtensionTester class in its own module
class ExtensionTester {
  async runTests(extensionPath) {
    console.log('Running tests for extension at path:', extensionPath);
    // Fetching the system-wide installation of Chromium
    const { stdout: chromiumPath } = await exec('which chromium');
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ],
      executablePath: chromiumPath.trim()
    });

    // Ensure each session uses a separate browser context for isolation
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto('https://example.com');
    const isPreviewPaneInjected = await page.evaluate(() => {
      const previewPane = document.getElementById('extension-preview-panel');
      return previewPane !== null;
    });
    const isWrapperAdjusted = await page.evaluate(() => {
      const wrapper = document.querySelector('.wrapper_new');
      return wrapper && getComputedStyle(wrapper).width === 'calc(100% - 50%)';
    });

    // Navigate to the extension's index.html page
    const extPage = await context.newPage();
    const extensionUrl = `chrome-extension://${extensionId}/index.html`;
    await extPage.goto(extensionUrl, { waitUntil: 'networkidle0' });
    const screenshotPath = 'test-result.png';
    await extPage.screenshot({ path: screenshotPath });

    // Closing the browser context after the test
    await context.close();
    await browser.close();
    const report = {
      extensionId,
      extensionUrl,
      isPreviewPaneInjected,
      isWrapperAdjusted,
      screenshotPath
    };

    fs.writeFileSync('test-result.json', JSON.stringify(report, null, 2));
    return report;
  }
}

module.exports = ExtensionTester;