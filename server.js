const puppeteer = require("puppeteer");
let db;
const { MongoClient } = require("mongodb");

async function testing() {
  const url = "mongodb+srv://ziming99:coolsinxx2@cluster0.e9nwn.mongodb.net/";
  const client = new MongoClient(url);

  try {
    await client.connect();
    // await scrapeProduect(
    //   "https://finance.yahoo.com/quote/7113.KL/history?p=7113.KL",
    //   client
    // );
    await getAllStockNumber(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}


async function getAllStockNumber(client)
{
    let number;
    for(let k=2;k<=38;k++)
    {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto("https://www.malaysiastock.biz/Listed-Companies.aspx?type=A&value=I", {
        timeout: 0
      });
      const [el] = await page.$x(
        '//*[@id="MainContent_tStock"]/tbody/tr['+k+']/td[1]/h3[1]/a'
      );
      if (el == undefined) {
        console.log("Out");
      }
      else{
        const numberText = await el.getProperty("textContent");
        const numTxt = await numberText.jsonValue();
        let number = numTxt.replace(/[^0-9]/g, '');
        console.log(number);
        saveStockNumber(client,{stocknumber:number});
      }
      
    }

}
async function saveStockNumber(client,number){
    console.log("dasda");
    try {
      let result = await client
        .db("stock")
        .collection("test")
        .insertOne(number);
        console.log("Success");
    } catch (err) {
      console.log(err);
    }
}
async function uploadStockData(client, data) {
  try {
    let result = await client
      .db("stock")
      .collection("detail")
      .insertMany(data);
      console.log("Success");
      console.log(result.insertedCount);
  } catch (err) {
    console.log(err);
  }

}


async function scrapeProduect(url, client) {
  const browser = await puppeteer.launch();

  let date = new Array();
  let open = new Array();
  let close = new Array();
  let volume = new Array();
  try {
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 0
    });

    for (let i = 1; i < 60; i++) {
      const [el] = await page.$x(
        '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[' +
          i +
          "]/td[1]/span"
      );
      if (el == undefined) {
        console.log("Out");
        break;
      }
      const text = await el.getProperty("textContent");
      const rawTxt = await text.jsonValue();

      date.push(rawTxt);

      const [el2] = await page.$x(
        '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[' +
          i +
          "]/td[2]/span"
      );
      const text2 = await el2.getProperty("textContent");
      const rawTxt2 = await text2.jsonValue();
      open.push(rawTxt2);

      const [el3] = await page.$x(
        "/html/body/div[1]/div/div/div[1]/div/div[3]/div[1]/div/div[2]/div/div/section/div[2]/table/tbody/tr[" +
          i +
          "]/td[5]/span"
      );
      const text3 = await el3.getProperty("textContent");
      const rawTxt3 = await text3.jsonValue();
      close.push(rawTxt3);

      const [el4] = await page.$x(
        '//*[@id="Col1-1-HistoricalDataTable-Proxy"]/section/div[2]/table/tbody/tr[' +
          i +
          "]/td[7]/span"
      );
      const text4 = await el4.getProperty("textContent");
      const rawTxt4 = await text4.jsonValue();
      volume.push(rawTxt4);
    }
  } catch (err) {
    console.log(err.message);
  }
  console.log(date);
  await uploadStockData(client, [{
    name: 7113,
    date: date,
    open: open,
    close: close,
    volume: volume
  }]);
  console.log(close[5]);
  browser.close();
}
testing().catch(console.error);
