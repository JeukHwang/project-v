import fs from "fs";
import path from "path";
import puppeteer, { Page } from "puppeteer";

const data = JSON.parse(fs.readFileSync("fetch.json", "utf-8"));

async function downloadAll() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();

  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.resolve("./downloads2"),
  });

  //   console.log(data.length);

  const files = fs.readdirSync("./downloads2");
  console.log(files.length, data.length);
  //   console.log(files.length);

  let counter = 0;
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (
      files.includes(
        `개표현황(읍면동별)[${entry.electionCodeName}][국회의원선거][${entry.electionType}][${entry.city}][${entry.district}].xlsx`
      )
    )
      continue;
    console.log(
      `${counter++}/${data.length - files.length} : ${JSON.stringify(entry)}`
    );
    await download(page, entry);
  }

  await browser.close();
}

const dropdownSelectors = [
  ["select#electionName", "electionCodeName"],
  ["select#electionCode", "electionType"],
  ["select#cityCode", "city"],
  ["select#townCode", "district"],
];

async function download(page: Page, entry: any) {
  await page.goto(
    "http://info.nec.go.kr/main/showDocument.xhtml?electionId=0000000000&topMenuId=VC&secondMenuId=VCCP04",
    { waitUntil: "networkidle2" }
  );

  // Wait for the dropdown to be available and click to open it
  await page.waitForSelector("#electionType2");
  await page.click("#electionType2");

  for (const [selector, key] of dropdownSelectors) {
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector) as HTMLSelectElement;
        return el.options.length > 1;
      },
      {},
      selector
    );
    const options = await page.$eval(selector, (el) =>
      Array.from((el as HTMLSelectElement).options).map((option) => ({
        value: option.value,
        label: option.textContent!,
      }))
    );
    const value = options.find((option) => option.label === entry[key])!.value;
    await page.select(selector, value);
  }
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  await page.waitForSelector("#searchBtn", { visible: true });
  await page.click("#searchBtn");

  //   await new Promise((resolve) => setTimeout(resolve, 500));
  await page.waitForSelector(".dt_down:nth-child(2)", { visible: true });
  await page.click(".dt_down:nth-child(2)");

  await new Promise((resolve) => setTimeout(resolve, 4000));
}

// downloadAll();

function checkDownload() {
  const required = JSON.parse(fs.readFileSync("fetch.json", "utf-8"));
  const finished = fs.readdirSync(
    path.resolve("../data/raw/개표현황(읍면동별)")
  );
  console.assert(
    required.length === finished.length,
    "Not all files downloaded"
  );
  console.log({ required: required.length, finished: finished.length });
}

checkDownload();
