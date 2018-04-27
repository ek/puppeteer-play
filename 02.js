const puppeteer = require('puppeteer');



(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250 // slow down by 250ms
  });
  const page = await browser.newPage();

  // log all page console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // go to page
  await page.goto('https://mozilla.org', {waitUntil: 'networkidle2'});

  // evaluate on page load
  await page.evaluate(() => {

    // converts document.stylesheets to an array
    const getSheetsArray = (s) => [].slice.call(s)
    // filters for external stylesheets
    const getExternalSheetsArray = (sa) => sa.filter(v => typeof v.href === 'string')
    // filters for internal stylesheets
    const getInternalSheetsArray = (sa) => sa.filter((v) => typeof v.href !== 'string')
    // checkSheetList
    const checkSheetList = function(list) {
      if(!list.includes(undefined)) {
        console.log('all sheets reloaded by css-audit')
        console.log(list)
      }
    }

    console.log(`url is ${location.href}`)
    const sheets = document.styleSheets
    console.log(`sheets length: ${sheets.length}`)
    
    const sheetsArray = getSheetsArray(sheets)
    console.log(`sheets array length : ${sheetsArray.length}`)
    
    // filter to only external scripts (will deal with internal scripts later)
    const externalSheets = getExternalSheetsArray(sheetsArray)
    const internalSheets = getInternalSheetsArray(sheetsArray)
    
    console.log(`# of externalSheets: ${externalSheets.length}`)
    console.log(`num of internalSheets: ${internalSheets.length}`)

    const getUrl = (url, callback) => {
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
              // successful, call the callback
              callback(httpRequest.responseText);
          } else {
              // error, call the callback -- here we use null to indicate the error
              callback(null);
          }
        } else {
            // not ready
        }
      };
      // httpRequest.setRequestHeader('content-type', 'text; charset="utf-8"')
      httpRequest.open('GET', url, true);
      httpRequest.send();
    }

    const sheetList = new Array(sheetsArray.length)
    sheetsArray.forEach((sheet,i,a) => {
      sheet.disabled = true
      if(typeof sheet.href === 'string') {
        getUrl(sheet.href, function (data) {
          if(data === null) {
            console.log(`unable to load sheet: ${sheet.href}`)
          } else {
            const externalStyleString = `<style 
              id="sheet-${i}" 
              data-url="${sheet.href}">
                ${data}
              </style>`
            $("head").append(externalStyleString);
            sheetList[i] = $(`#sheet-${i}`)
            checkSheetList(sheetList)
          }
        });
      } else {
        const internalStyleString = `<style 
          id="sheet-${i}">
            ${sheet.ownerNode.textContent}
          </style>`
        $("head").append(internalStyleString);
        sheetList[i] = $(`#sheet-${i}`)
        checkSheetList(sheetList)
      }
    })
  })
  
  await page.evaluate(() => {
    setTimeout(() => {
      console.log(document.styleSheets.length)
    }, 1000)
    
  })

  await browser.close()

})();