const puppeteer = require('puppeteer');
const fs = require('fs');

// Setting up the ExtensionTester class in its own module
class ExtensionTester {
  async runTests(extensionPath) {
    console.log('Running tests for extension at path:', extensionPath);
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => target.type() === 'service_worker' && target.url().includes(extensionPath));
    const partialExtensionUrl = extensionTarget.url() || '';
    const [, , extensionId] = partialExtensionUrl.split('/');

    // Opening a new page to test content script injection
    const page = await browser.newPage();
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
    const extPage = await browser.newPage();
    const extensionUrl = `chrome-extension://${extensionId}/index.html`;
    await extPage.goto(extensionUrl, { waitUntil: 'networkidle0' });
    const screenshotPath = 'test-result.png';
    await extPage.screenshot({ path: screenshotPath });
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