const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://mozilla.org', {waitUntil: 'networkidle2'});

  await page.evaluate(() => {
    console.log(`url is ${location.href}`)
    const sheets = document.styleSheets
    console.log(`sheets length: ${sheets.length}`)
  });
  
  

  await browser.close();
})();