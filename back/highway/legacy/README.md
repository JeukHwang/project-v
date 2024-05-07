https://overpass-turbo.eu/#

```
[out:json][timeout:50];
// Find South Korea by its name
area["ISO3166-1"="KR"][admin_level=2]->.southKorea;
// Fetch motorways in the area of South Korea
(
  way(area.southKorea)["highway"="motorway"];
);
// setup the output
out body;
>;
out skel qt;
```

https://kiss.kstudy.com/Detail/Ar?key=2887884

다운
https://business.juso.go.kr/addrlink/elctrnMapProvd/geoDBDwldSubmitDetail.do?type=geo&reqSeq=&reqstGroup=31176

도시 몇 개나 하지? - 위키 인구순 도시 목록
https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%9D%98_%EC%9D%B8%EA%B5%AC%EC%88%9C_%EB%8F%84%EC%8B%9C_%EB%AA%A9%EB%A1%9D

보고 배울만한 선거 시각화
https://github.com/vuski/presidentialElection2022SouthKoreaEmdmap/tree/main
https://archive.nytimes.com/www.nytimes.com/interactive/2012/11/02/us/politics/paths-to-the-white-house.html

shapefile visualization
https://codesandbox.io/p/sandbox/loading-shape-file-on-react-leaflet-b2d156

shp 2 geojson
https://park9eon.com/how-to-convert-to-korea-shp-geojson/
https://github.com/mbostock/shapefile

d3js
https://d3js.org/

react+d3
https://sypear.tistory.com/85

일반국도
국가 교통망
국가개간교통망
국가
https://www.data.go.kr/data/15122482/fileData.do

time cartogram

https://googlemapsmania.blogspot.com/2017/12/how-time-can-bend-space.html
https://www.researchgate.net/figure/Distance-cartogram-time-of-journey-with-the-London-underground-source_fig1_282628452

Great example for time cartogram

https://subway.nateparrott.com/
https://github.com/nate-parrott/subway/tree/master#nyc-travel-time-map

Travel Time(Time Travel) Map
https://www.oskarlin.com/2005/11/29/time-travel/
https://www.tom-carden.co.uk/p5/tube_map_travel_times/applet/
https://www.researchgate.net/figure/Distance-cartogram-time-of-journey-with-the-London-underground-source_fig1_282628452
https://subway.nateparrott.com/

도시간 소요시간(20170201~)
https://data.ex.co.kr/visual/analysis

기타 논문
https://www.researchgate.net/figure/The-spatial-temporal-correlation-diagram-of-traffic-flow_fig1_335800575
[Temporal Distance Map: A Warped Isochrone Map Depicting Accurate Travel Times](https://personales.upv.es/thinkmind/dl/conferences/geoprocessing/geoprocessing_2020/geoprocessing_2020_1_150_30097.pdf)

위키 - 속도 제한
https://ko.wikipedia.org/wiki/%EC%86%8D%EB%8F%84_%EC%A0%9C%ED%95%9C

도로 개발
http://nationalatlas.ngii.go.kr/pages/page_313.php
https://mdogu.tistory.com/2

SHP 국토교통부\_일반국도 도로중심선 - https://www.data.go.kr/data/15122482/fileData.do

Time cartogram 관련 논문들
https://cartographicperspectives.org/index.php/journal/article/download/cp77-kraak-et-al/1321?inline=1

- https://www.researchgate.net/publication/287590100_Integrated_Time_and_Distance_Line_Cartogram_a_Schematic_Approach_to_Understand_the_Narrative_of_Movements
- https://www.researchgate.net/publication/308694153_Using_cartograms_to_explore_temporal_data_Do_they_work
- https://www.researchgate.net/publication/271992216_An_alternative_method_to_constructing_time_cartograms_for_the_visual_representation_of_scheduled_movement_data

Cartogram usecase
https://gistbok.ucgis.org/knowledge-area/cartography-and-visualization

- essence of temporal data -> visualization

  - history = d/dt (change)
  - cartogram = ((f, pos, t) -> color) for each pos

되게 학술적이고 실용적인 내용
https://gistbok.ucgis.org/knowledge-area/cartography-and-visualization - 색깔, 미학, 분류 등
https://gistbok-ltb.ucgis.org/page/18/dashboard


지도 시각화 CRS
https://rooney-song.tistory.com/54
https://gis.stackexchange.com/questions/310091/what-does-the-default-crs-being-epsg3857-in-leaflet-mean

0.001 => intersection


https://www.yna.co.kr/view/AKR20210512040200530