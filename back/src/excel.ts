import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

XLSX.set_fs(fs);

function readExcelAsJson(fileName: string) {
  const workbook = XLSX.readFile(
    path.join(__dirname, `../../data/${fileName}.xlsx`)
  );
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(worksheet);
  return json;
}

function saveJson(json: any, fileName: string) {
  fs.writeFileSync(
    path.join(__dirname, `../../data/${fileName}_from_excel.json`),
    JSON.stringify(json, null, 2)
  );
}
// console.log(readExcelAsJson("의원검색"));
saveJson(readExcelAsJson("의원검색"), "의원검색");

// print 시군구
// const sgg = uewon.features.map((feature) => feature.properties.SGG_3);
// sgg.sort();
// for (let i = 0; i < sgg.length; i++) {
//     console.log(sgg[i]);
// }
// console.log(JSON.stringify(sgg, null, 2));
