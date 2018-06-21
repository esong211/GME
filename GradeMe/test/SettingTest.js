/*
 * Selenium test for Setting.
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
const TIMEOUT = 60 * 1000;

/* Web components path */
var loginBtnXPath = '//*[@id="button-blue"]';
var emailPath = '//*[@id="app"]/div/div[2]/div/div/div[1]/input';
var passwordPath = '//*[@id="app"]/div/div[2]/div/div/div[2]/input';
var testEmail = 'scsteph2@illinois.edu';
var testPassword = 'hello!';

var settingBtnPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[3]/a/h3';
var generalInfoPath = '//*[@id="app"]/div/div[2]/div/div/div/a[1]';
var changepwPath = '//*[@id="app"]/div/div[2]/div/div/div/a[2]';
var deactivePath = '//*[@id="app"]/div/div[2]/div/div/div/a[3]';

describe('Settings tests', function() {
    this.timeout(TIMEOUT);
    // Build fresh chrome drive for each instance
    // and log in with correct credential
    beforeEach(function() {
        var chromeCapabilities = webdriver.Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', {
            'args': ['--headless', '--disable-gpu']
        });

        browser = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .build();
        browser.get(webURL);
        onSubmit(testEmail, testPassword);
        this.timeout(TIMEOUT);
    });
    
    // Quit each driver when finished
    afterEach(function() {
        browser.quit();
    });

    // Test Setting navigation
    it('Click Settings should navigate to setting', function() {
        var urlConent = 'setting';

        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>browser.findElement(By.xpath(settingBtnPath)).click())
            .then(()=>browser.wait(until.urlContains(urlConent)), TIMEOUT);
    });

    // Test setting center content
    it('Settings shoud contain general info tag', function() {
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(settingBtnPath, generalInfoPath);
            });
    });

    it('Settings shoud contain change password tag', function() {
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(settingBtnPath, changepwPath);
            });
    });

    it('Settings shoud contain deactivate tag', function() {
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(settingBtnPath, deactivePath);
            });
    });
})

describe('Setting center subpage tests', function() {
    this.timeout(TIMEOUT);
    // Build fresh chrome drive for each instance
    // and log in with correct credential
    beforeEach(function() {
        var chromeCapabilities = webdriver.Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', {
            'args': ['--headless', '--disable-gpu']
        });

        browser = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .build();
        browser.get(webURL);
        onSubmit(testEmail, testPassword);
        this.timeout(TIMEOUT);
    });
    
    // Quit each driver when finished
    afterEach(function() {
        browser.quit();
    });

    // general information content
    it('General information tag content', function() {  
        var generalMsg = 'General Information';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>onClick(settingBtnPath, generalInfoPath))
            .then(()=>containsMsg(generalInfoPath, generalMsg))
            .catch ( function (e) {
                console.log(e);
                done()
            })
    });

    it('General information subpage content', function() {
        var pageTitlePath = '//*[@id="app"]/div/div[2]/div/div/form/div/div/form/h1';  
        var titleMsg = 'Change your general information';
        var submitBtnPath = '//*[@id="app"]/div/div[2]/div/div/form/div/div/form/button';
        var submitBtnMsg = 'Submit';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>onClick(settingBtnPath, generalInfoPath))
            .then(()=>
                    containsMsg(pageTitlePath, titleMsg)&&
                    containsMsg(submitBtnPath, submitBtnMsg)
            )
            .catch ( function (e) {
                console.log(e);
                done()
            })
    });

    // change password content
    it('Change password tag content', function() {  
        var changepwMsg = 'Change Password';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>onClick(settingBtnPath, changepwPath))
            .then(()=>containsMsg(changepwPath, changepwMsg))
            .catch ( function (e) {
                console.log(e);
                done()
            })
    });

    it('Change password subpage content', function() {  
        var subpageTitlePath = '//*[@id="app"]/div/div[2]/div/div/form/div/div/form/h1';
        var titleMsg = 'Change your password';
        var submitBtnPath = '//*[@id="app"]/div/div[2]/div/div/form/div/div/form/button';
        var submitBtnMsg = 'Submit';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
        .then(()=>onClick(settingBtnPath, changepwPath))
        .then(()=>onClick(changepwPath, changepwPath))
        .then(()=>
                containsMsg(subpageTitlePath, titleMsg)&&
                containsMsg(submitBtnPath, submitBtnMsg)
        )
        .catch ( function (e) {
            console.log(e);
            done()
        })
    });
})

/* Parameterized unit tests
*  If target element is displayed
*/
function onClick(buttonPath, targetElementPath) {
    var button = browser.findElement(By.xpath(buttonPath)).click();
    return button
        .then( function () {
            return browser.wait(function() {
                return browser.findElement(By.xpath(targetElementPath)).isDisplayed();
              }, TIMEOUT);
        });
}

/* Parameterized unit tests
*  If element contains correct msg
*/
function containsMsg(elementPath, msg) {
    return browser.findElement(By.xpath(elementPath))
        .getText()
        .then(function(v) {
            return assert.equal(v, msg);
        })
        .catch (function (e) {
            console.log(e);
            done();
        })
}

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