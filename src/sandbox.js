require('dotenv').config();
const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const browserVersion = await browser.version();
  console.log(`Started ${browserVersion}`);

  const page = await browser.newPage();

  try {
    await page.goto('https://www.coingecko.com/account/sign_in');
    await page.waitForTimeout(5 * 1000); // cloudflare wait time

    await page.waitForSelector('form#new_user');

    await page.type('input#user_email', process.env.USERNAME);
    await page.type('input#user_password', process.env.PASSWORD);

    await page.keyboard.press('Enter');

    await page.waitForNavigation();

    await page.waitForTimeout(5 * 1000);

    await page.goto('https://www.coingecko.com/account/candy?locale=en');

    const buttonCollectSelector = 'form.button_to input.collect-candy-button';
    const balanceSelector = 'div[data-target="points.balance"]';

    // await page.evaluate(() => {
    //   window.scrollBy(0, window.innerHeight);
    // });

    const rewardButton = await page.$(buttonCollectSelector);

    if (rewardButton === null) {
      console.log('Daily reward already collected.');
    } else {
      rewardButton.click();
      console.log('Reward collected!');
    }

    await page.waitForSelector(balanceSelector);
    let balance = await page.$eval(balanceSelector, el => el.textContent);

    console.log(`Balance: ${balance}`);

    await browser.close();
  } catch (error) {
    console.error(error);
    return;
  }
})();