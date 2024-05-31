import axios from "axios";
import fs from "fs";

async function downloadExcel() {
  try {
    // const response = await axios.post(
    //   "http://info.nec.go.kr/UbiServerWeb/UbiServer.do",
    //   new URLSearchParams({
    //     cHJvY2lk: "GATEWAY",
    //     reqtype: "94",
    //     reqsubtype: "undefined",
    //     jrffile: "report_E.jrf",
    //     resid: "UBIHTML",
    //     key: ".elecapp1_servlet_engine3",
    //     serviceid:
    //       "e0jK5FJ4fA1acWdgieV6aaZLHvCULl61SKtNXYCg0yBO3Da5znUfEsWdon3Aw1Dn.elecapp1_servlet_engine1",
    //     reporttitle:
    //       "개표현황(읍면동별)[제18대][국회의원선거][국회의원선거][서울특별시][중구]",
    //     exportseq: "1716749336807",
    //     exportfilename: "report_E.xlsx",
    //     exceladjustpage: "false",
    //   }),
    //   {
    //     headers: {
    //       Accept:
    //         "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //       "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    //       "Cache-Control": "max-age=0",
    //       Connection: "keep-alive",
    //       Cookie:
    //         "WMONID=-04f6tYl2gi; JSESSIONID=nSAZIHZJDMgN93otBLYRhQx74h0p1dWTSarWZn41C0mOJVqYz58N5B1aDN67kwSD.elecapp1_servlet_engine3",
    //       DNT: "1",
    //       Origin: "http://info.nec.go.kr",
    //       Referer: "http://info.nec.go.kr/ubi4/ubihtml.jsp",
    //       "Upgrade-Insecure-Requests": "1",
    //       "User-Agent":
    //         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    //     },
    //     responseType: "arraybuffer",
    //   }
    // );

    const response = await axios.post(
      "http://info.nec.go.kr/UbiServerWeb/UbiServer.do",
      new URLSearchParams({
        cHJvY2lk: "GATEWAY",
        reqtype: "94",
        reqsubtype: "undefined",
        jrffile: "report_E.jrf",
        resid: "UBIHTML",
        key: "e0jK5FJ4fA1acWdgieV6aaZLHvCULl61SKtNXYCg0yBO3Da5znUfEsWdon3Aw1Dn.elecapp1_servlet_engine1",
        serviceid: "3CBF599D369A57746DA5E4C03ABB",
        reporttitle:
          "개표현황(읍면동별)[제19대][국회의원선거][국회의원선거][인천광역시][미추홀구]",
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

    // Save the binary data as an Excel file
    fs.writeFileSync("fetch2.xlsx", response.data);

    console.log("File saved successfully as fetch.xlsx");
  } catch (error) {
    console.error("Error downloading the Excel file:", error);
  }
}

downloadExcel();
