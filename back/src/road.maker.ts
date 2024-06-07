import ROADS_CACHED from "../../data/highway/processed/ROADS.json";
import ROADS_PARSED_CACHED from "../../data/highway/processed/ROADS_PARSED.json";
// https://github.com/JeukHwang/project-v/blob/90af5e13a0bd1efd8c3947405d8c78115f4bd1f7/back/src/connect.ts
// for (const [group, roads] of ROADS_CACHED) {
//     console.log(group, roads.length, ...roads.map(road => road.length));
// }
console.log(ROADS_CACHED.filter(([group]:[string]) => group.endsWith("고속도로")).length);

for (const [group, parsed] of ROADS_PARSED_CACHED) {
    console.log(group, parsed.nodes.length, ...parsed.nodes.map(road => road.length));
}
console.log(ROADS_PARSED_CACHED.length);