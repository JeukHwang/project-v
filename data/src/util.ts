import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

XLSX.set_fs(fs);

export function readExcelAsJson<T>(filePath: string): { [key in string]: T } {
  const workbook = XLSX.readFile(path.join(__dirname, filePath));
  return Object.fromEntries<T>(
    workbook.SheetNames.map((name) => [
      name,
      XLSX.utils.sheet_to_json(workbook.Sheets[name]) as T,
    ])
  );
}

export function saveJson(json: any, filePath: string): void {
  fs.writeFileSync(
    path.join(__dirname, filePath),
    JSON.stringify(json, null, 2)
  );
}
