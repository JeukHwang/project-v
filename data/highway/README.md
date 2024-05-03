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
