/*
 * Selenium test for Login.
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
// var webURL = 'https://grademereact.azurewebsites.net/#/login';
var webURL = 'http://localhost:8080/#/login';
var browser;

/* Web components path */
var loginBtnXPath = '//*[@id="button-blue"]';
var emailPath = '//*[@id="app"]/div/div[2]/div/div/div[1]/input';
var passwordPath = '//*[@id="app"]/div/div[2]/div/div/div[2]/input';
const TIMEOUT = 60 * 1000;

describe('Login tests', function() {
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

    // Test with correct credential
    it('Login with correct credential', function() {
        // registered user.
        var testEmail = 'scsteph2@illinois.edu';
        var testPassword = 'hello!';
        var logoutPath = '//*[@id="theme-blue"]';

        var submit = onSubmit(testEmail, testPassword);
        return submit
            .then( function () {
                return browser.wait(until.urlContains('dashboard'), TIMEOUT);
            })
            .catch (function (e) {
                console.log(e);
            })
    });

    // Test with wrong credential
    it('Login with wrong credential', function() {
        this.timeout(TIMEOUT);
        // unregistered user.
        var testEmail = 'wrong@gmail.com';
        var testPassword = 'wrong';

        var wrongInfoPath = '//*[@id="app"]/div/div[2]/div/div/p';
        var submit = onSubmit(testEmail, testPassword);
        return submit
            .then( function () {
                return browser.wait(function() {
                    return browser.findElement(By.xpath(wrongInfoPath)).isDisplayed();
                }, TIMEOUT)
            })
            .catch (function (e) {
                console.log(e);
            })
    });
});

/* Parameterized unit tests
*  Login functionality.
*/
function onSubmit(testEmail, testPassword) {
    return browser.findElement(By.xpath(emailPath)).sendKeys(testEmail)
        .then( function () {
            browser.findElement(By.xpath(passwordPath)).sendKeys(testPassword);
        })
        .catch (function (e) {
            console.log(e);
        })
        .then( function () {
            browser.findElement(By.xpath(loginBtnXPath)).click();
        })
        .catch (function (e) {
            console.log(e);
        })
}
