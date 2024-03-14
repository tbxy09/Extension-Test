const util = require('util');
const cy = require('cypress');
const exec = util.promisify(require('child_process').exec);


class CypressTester {

  async runTests(extensionPath) {

    // Get chromium browser path
    const { stdout } = await exec('which chromium');
    const browserPath = stdout.trim();
    // console.log('extenionPath', extensionPath)
    await cy.run({
      browser: browserPath,
      headless: false,
      screenshotOnRunFailure: true,
      spec: `cypress/integration/extension_spec.js`,
      env: {
        extensionPath
      },
    })

    // Get test run artifacts
    // const { failures, video } = Cypress.spec;

    return {
      // isPass: failures === 0,
      // videoPath: video,
    };

  }

}

// Export the CypressTester class
module.exports = CypressTester;