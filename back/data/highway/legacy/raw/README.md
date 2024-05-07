# Highway shape data

Reference: [Overpass Turbo](https://overpass-turbo.eu/)

Query:

```Overpass QL
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

Output:

- export.json : raw OSM format
- export.geojson : GeoJSON format

# Highway construction date data

Reference: [한국도로공사 고속도로 공공데이터 포털](https://data.ex.co.kr/openapi/basicinfo/openApiInfoM?apiId=0614)

Output explanation: 
```text
routeName	string	노선명
sectionName	string	구간명
bizMgmtName	string	명칭
cnstnExtns	string	공사연장
cnstnTerm	string	공사기간
cmcnDate	string	준공날짜
cnstnStpntAddr	string	공사시점주소
cnstnEnpntAddr	string	공사종점주소
cmcnCstrClss	string	준공시공구분
cnsof	string	사업단
cmcnCstrClssCd	string	준공시공구분코드 (준공 : C03, 시공 : C02)
numOfRows	string	한 페이지당 출력건수
pageNo	string	출력 페이지번호
pageSize	string	전체 페이지 수
code	string	결과
message	string	결과 메시지
count	string	전체 결과 수
```

Output:
- 시공.xml : maximum set of acceisslbe data when cmcnCstrClssCd is C02
- 준공.xml : maximum set of acceisslbe data when cmcnCstrClssCd is C03
- 시공.json : 시공.xml converted by [codebeautify](https://codebeautify.org/xmltojson)
- 준공.json : 준공.xml converted by [codebeautify](https://codebeautify.org/xmltojson)