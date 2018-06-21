/*
 * Selenium test for Homepage redirections.
 */

// Setup selenium webdriver
const webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var assert = require('assert');
const until = webdriver.until;
const By = webdriver.By;

// Set up chrome driver path
var path = require('chromedriver').path;
var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

/* Gloable parameters. */
// var webURL = 'https://grademereact.azurewebsites.net/#/';
var webURL = 'http://localhost:8080/#/';
var browser;
const TIMEOUT = 60 * 1000;

describe('Homepage tests', function(done) {
    this.timeout(TIMEOUT);
    // Build fresh chrome drive for each instance
    beforeEach(function() {
        var chromeCapabilities = webdriver.Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', {
            'args': ['--headless', '--disable-gpu']
        });

        browser = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .build();
        browser.get(webURL);
    });

    // Quit each driver when finished
    afterEach(function() {
        browser.quit();
    });

    // Test login button exists
    it('Login button exitst', function() {
        var loginButtonName = 'login';
        return browser.findElement(By.name(loginButtonName));
    });

    // Test login navigation
    it('Click login button redirect to login', function() {
        var loginButtonName = 'login';
        var loginBtn = browser.findElement(By.name(loginButtonName)).click();
        return loginBtn.then(()=>browser.wait(until.urlContains('login'), TIMEOUT));
    });

    // Test login button exists
    it('Login button exitst', function() {
        var loginButtonName = 'login';
        return browser.findElement(By.name(loginButtonName));
    });

    it('Click signUp button redirect to register', function() {
        var signupButtonName = 'signu';
        var signupBtn = browser.findElement(By.name(signupButtonName)).click();
        return signupBtn.then(()=>browser.wait(until.urlContains('register'), TIMEOUT));
    });
})
