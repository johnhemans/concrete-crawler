const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });



  const page = await browser.newPage();
  await page.goto('https://concreteplayground.com/sydney/bars');

  const totalItems = await getAllItems(page);

  await browser.close();

  await exportData(totalItems);
})();

async function getAllItems(page) {
  if (!page) throw 'No page provided!';
  let totalItems = [];

  const items = await getItems(page);
  totalItems = [...totalItems, ...items];

  if (await nextPage(page)) {
    const moreItems = await getAllItems(page)
    totalItems = [...totalItems, ...moreItems]
  }

  return totalItems;
}

async function getItems(page) {
  if (!page) throw 'No page provided!';

  return await page.$$eval('.data-item', dataItems => dataItems.map(data => JSON.parse(data.textContent)));
}

async function nextPage(page) {
  if (!page) throw 'No page provided!';

  return await page.evaluate(() => {
    const el = document.querySelector('a.next.page-numbers')
    if (el) {
      el.click();
      return true;
    }
    return false;
  })
}

async function exportData(data) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    fs.writeFile(`${__dirname}/output/bars.json`, json, 'utf8', err => {
      if (err) reject(err);
      else resolve();
    }
    )
  })
}