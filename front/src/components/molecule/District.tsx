import { Marker, Popup } from "react-leaflet";
import { Ring } from "topojson-simplify";
import { centroid, simplified } from "../../util/geojson";
import MapGeoJSON from "./MapGeoJSON";

type DistrictGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  { EMD_CD: string; EMD_KOR_NM: string; EMD_ENG_NM: string }
>;

const districts = [
  "강원특별자치도",
  "경기도",
  "경상남도",
  "경상북도",
  "광주광역시",
  "대구광역시",
  "대전광역시",
  "부산광역시",
  "서울특별시",
  "세종특별자치시",
  "울산광역시",
  "인천광역시",
  "전라남도",
  "전북특별자치도",
  "제주특별자치도",
  "충청남도",
  "충청북도",
];

const modules = import.meta.glob(
  "../../../../data/processed/구역의도형_240505/*.shp.converted.json",
  { eager: true }
) as Record<string, DistrictGeoJSON>;
function districtToJSON(district: string): DistrictGeoJSON {
  return modules[
    `../../../../data/processed/구역의도형_240505/${district}.shp.converted.json`
  ];
}

// any one feature
console.log(districtToJSON("강원특별자치도").features[0]);
// simplied features
console.log(simplified([districtToJSON("강원특별자치도").features[0]]));

const readyToGo = Object.fromEntries(
  districts.map((d) => {
    const json = districtToJSON(d);
    const features = json.features.filter(
      (f) => !f.properties.EMD_KOR_NM.includes("출장소")
    );

    const centroids = features.map((f) => {
      switch (f.geometry.type) {
        case "Polygon":
          return centroid(f.geometry.coordinates as Ring[]);
        case "MultiPolygon":
          return centroid(f.geometry.coordinates.map((c) => c[0]) as Ring[]);
      }
    });
    return [d, { features, centroids }];
  })
);
// console.log(JSON.stringify(readyToGo));

// const readyToGo = (
//   await import("../../../../data/processed/구역의도형_240505/readyToGo.json")
// ).default as Record<
//   string,
//   { features: DistrictGeoJSON["features"]; centroids: Position[] }
// >;

export default function District() {
  return districts.map((d) => {
    const { features, centroids } = readyToGo[d];
    return features.map((f, i) => (
      <div key={f.properties.EMD_CD}>
        <Marker position={centroids[i]}>
          <Popup>
            {d} {f.properties.EMD_KOR_NM}
          </Popup>
        </Marker>
        <MapGeoJSON
          data={f}
          attr={""}
          pathOptions={{
            stroke: false,
            color: "black",
            weight: 1,
            fill: true,
            fillColor: "black",
            fillOpacity: 0.2,
          }}
        />
      </div>
    ));
  });
}
