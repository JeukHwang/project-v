import fs from "fs";
import path from "path";

function move() {
  const f = path.resolve("./data/election/raw/구역의도형_240505/전체분");
  const files = fs
    .readdirSync(f)
    .filter(
      (name) =>
        name !== ".DS_Store" &&
        name !== "TL_SCCO_GEMD" &&
        !name.endsWith(".zip")
    );
  console.log(files, files.length);
  for (const file of files) {
    fs.copyFileSync(
      path.resolve(f, file, "TL_SCCO_GEMD.shp"),
      path.resolve(f, "TL_SCCO_GEMD", `${file}.shp`)
    );
  }
  // fs.copyFileSync(path.resolve(), path.resolve());
  // path.resolve("./data/election/raw/구역의도형_240505/전체분");
}

function change() {
  // npx shp2json ./data/highway/raw/구역의도형_전체분_서울특별시/TL_SCCO_GEMD.shp --encoding euc-kr > seoul.shp.json
  const f = path.resolve(
    "./data/election/raw/구역의도형_240505/전체분/TL_SCCO_GEMD"
  );
  console.log(
    fs
      .readdirSync(f)
      .map((name) => `npx shp2json ./${name} --encoding euc-kr > ${name}.json`)
      .join(" && ")
  );
}
change();