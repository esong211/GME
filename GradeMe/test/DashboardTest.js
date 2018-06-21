/*
 * Selenium test for Dashboard.
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
const TIMEOUT = 40 * 1000;

/* Web components path */
var loginBtnXPath = '//*[@id="button-blue"]';
var emailPath = '//*[@id="app"]/div/div[2]/div/div/div[1]/input';
var passwordPath = '//*[@id="app"]/div/div[2]/div/div/div[2]/input';
var testEmail = 'scsteph2@illinois.edu';
var testPassword = 'hello!';


describe('Dashboard Logout test', function() {
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

    // Test log out
    it('Click Log out should return to login page', function() {
        var logoutBtnPath = '//*[@id="app"]/div/div[1]/div[1]/div/div[3]/a/button';

        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>browser.findElement(By.xpath(logoutBtnPath)).click())
            .then(()=>browser.wait(until.urlContains('login'), TIMEOUT));
    });

})

describe('Dashboard Button Tests', function() {
    this.timeout(TIMEOUT);
    // Build fresh chrome drive for each instance
    // and log in with correct credential
    before(function() {
        var chromeCapabilities = webdriver.Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', {
            'args': ['--headless', '--disable-gpu']
        });

        browser = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .build();
        browser.get(webURL);
        onSubmit(testEmail, testPassword);
    });

    // Test log out exist
    it('Log out button exist', function() {
        var logoutBtnPath = '//*[@id="app"]/div/div[1]/div[1]/div/div[3]/a/button';
        return elementExist(logoutBtnPath);
    });

    // Test if Welcom button exist
    it('Welcome button exitst', function() {
        var welcomPath = '//*[@id="app"]/div/div[1]/div[1]/div/div[1]/a/h3';
        return elementExist(welcomPath);
    });

    // Test if Home button exist
    it('Home button exitst', function() {
        var homePath = '//*[@id="app"]/div/div[1]/div[2]/div/div[1]/a/h3';
        return elementExist(homePath);
    });

    // Test if Grade button exist
    it('Grade button exitst', function() {
        var gradesPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[2]/a/h3';
        return elementExist(gradesPath);
    });

    // Test if Setting button exist
    it('Setting button exitst', function() {
        var settingPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[3]/a/h3';
        return elementExist(settingPath);
    });

    // Test page content
    // Home page
    it('Home page button content', function() {
        var welcomPath = '//*[@id="app"]/div/div[1]/div[1]/div/div[1]/a/h3';
        var welcomeMsg = 'Welcome, Sam';
        var homePath = '//*[@id="app"]/div/div[1]/div[2]/div/div[1]/a/h3';
        var homeMsg = 'Home';
        var gradesPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[2]/a/h3';
        var gradeMsg = 'Grades';
        var settingPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[3]/a/h3';
        var settingMsg = 'Settings';

        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                containsMsg(welcomPath, welcomeMsg);
                containsMsg(homePath, homeMsg);
                containsMsg(gradesPath, gradeMsg);
                containsMsg(settingPath, settingMsg);
            })
            .catch ( function (e) {
                console.log(e);
            })
    });
})




describe('Dashboard OnClick Tests', function() {
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

    // Home navigation
    it('Click home menu shoud show add course', function() {
        var homePath = '//*[@id="app"]/div/div[1]/div[2]/div/div[1]/a/h3';
        var addCoursePath = '//*[@id="cards-container"]/div/div/button[2]';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(homePath, addCoursePath);
            })
            .catch (function (e) {
                console.log(e);
            })
    });

    // Grades navigation
    it('Click grade menu shoud show select course', function() {
        var gradePath = '//*[@id="app"]/div/div[1]/div[2]/div/div[2]/a/h3';
        var selectPath = '//*[@id="app"]/div/div[2]/div/div/input';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(gradePath, selectPath);
            })
            .catch (function (e) {
                console.log(e);
            })
    });

    // Setting navigation
    it('Click settings menu should show change info form', function() {
        var settingPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[3]/a/h3';
        var generalInfoPath = '//*[@id="app"]/div/div[2]/div/div/form/div/div/form/h1';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(settingPath, generalInfoPath);
            })
            .catch (function (e) {
                console.log(e);
            })
    });
})


/* Parameterized unit tests
*  If target element is exist
*/
function elementExist(elementPath) {
    return browser.wait(until.urlContains('dashboard'), TIMEOUT)
        .then( function () {
            return browser.findElement(By.xpath(elementPath));
        });
}

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
        })
        .catch (function (e) {
            console.log(e);
            done();
        })
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