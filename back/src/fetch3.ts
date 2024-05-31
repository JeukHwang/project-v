import axios from "axios";
import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";

// Load the data from fetch.json
const data = JSON.parse(fs.readFileSync("fetch.json", "utf-8"));

// Function to download and save the Excel file for a given entry
async function downloadExcel(entry) {
  const { electionCodeName, electionType, city, district } = entry;

  try {
    const response = await axios.post(
      "http://info.nec.go.kr/UbiServerWeb/UbiServer.do",
      new URLSearchParams({
        key: "e0jK5FJ4fA1acWdgieV6aaZLHvCULl61SKtNXYCg0yBO3Da5znUfEsWdon3Aw1Dn.elecapp1_servlet_engine1",
        serviceid: "3CBF599D369A57746DA5E4C03ABB",
        reporttitle: `개표현황(읍면동별)[${electionCodeName}][국회의원선거][${electionType}][${city}][${district}]`,
        exportseq: "1716749336807",
        exportfilename: "report_E.xlsx",
        exceladjustpage: "false",
      }),
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "max-age=0",
          Connection: "keep-alive",
          Cookie:
            "WMONID=-04f6tYl2gi; JSESSIONID=e0jK5FJ4fA1acWdgieV6aaZLHvCULl61SKtNXYCg0yBO3Da5znUfEsWdon3Aw1Dn.elecapp1_servlet_engine1",
          DNT: "1",
          Origin: "http://info.nec.go.kr",
          Referer: "http://info.nec.go.kr/ubi4/ubihtml.jsp",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        responseType: "arraybuffer",
      }
    );

    // Save the binary data as an Excel file with a unique name
    const filename = path.join(
      __dirname,
      "downloads2",
      `report_${electionCodeName}_${city}_${district}.xlsx`
    );
    writeFile(filename, response.data);

    console.log(`File saved successfully as ${filename}`);
  } catch (error) {
    console.error(
      `Error downloading the Excel file for ${city} ${district}:`,
      error
    );
  }
}

// Ensure the download directory exists
if (!fs.existsSync("downloads")) {
  fs.mkdirSync("downloads");
}

// Download Excel files for all entries in the data
async function downloadAllExcels() {
  for (const entry of data) {
    await downloadExcel(entry);
    break;
  }
}

downloadAllExcels();
