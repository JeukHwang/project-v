import csv from "csv-parser";
import fs from "fs";

export async function csvToJson<T>(path: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data: T) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
}
