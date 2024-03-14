const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://baidu.com',
    specPattern: 'cypress/integration/**/*.spec.js',
    supportFile: 'cypress/support/commands.js',
  },

  chromeWebSecurity: false,
  video: false,
  noSandbox: true,
  viewportHeight: 720,
  viewportWidth: 1280,
  chromeWebSecurity: false,
  screenshotOnRunFailure: true,
  // experimentalStudio: true,
})