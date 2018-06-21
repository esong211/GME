/*
 * Selenium test for GradeCenter.
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

var gradesBtnPath = '//*[@id="app"]/div/div[1]/div[2]/div/div[2]/a/h3';

describe('GradeCenter tests', function() {
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

    // Test gradecenter navigation
    it('Click Grades should navigate to gradecenter', function() {
        var urlConent = 'gradecenter';

        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=>browser.findElement(By.xpath(gradesBtnPath)).click())
            .then(()=>browser.wait(until.urlContains(urlConent), TIMEOUT));
    });

    // Test gradecenter content
    it('Gradecenter shoud show select course', function() {
        var selectPath = '//*[@id="app"]/div/div[2]/div/div/input';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(gradesBtnPath, selectPath);
            });
    });

    it('Gradecenter shoud show grade title', function() {
        var tablePath = '//*[@id="app"]/div/div[2]/table/thead/tr/th[1]';
        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then( function () {
                return onClick(gradesBtnPath, tablePath);
            });
    });

    it('Grade table header', function() {
        var crsPath = '//*[@id="app"]/div/div[2]/table/thead/tr/th[1]';
        var crsMsg = 'Course';
        var asgnPath = '//*[@id="app"]/div/div[2]/table/thead/tr/th[2]';
        var asgnMsg = 'Assignment';
        var descPath = '//*[@id="app"]/div/div[2]/table/thead/tr/th[3]';
        var descMsg = 'Description';

        return browser.wait(until.urlContains('dashboard'), TIMEOUT)
            .then(()=> onClick(gradesBtnPath, crsPath))
            .then(()=>containsMsg(crsPath, crsMsg)&&
                    containsMsg(asgnPath, asgnMsg)&&
                    containsMsg(descPath, descMsg)
            );
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