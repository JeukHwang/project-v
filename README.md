# project-v

A history data visualization project | HSS304 Visualizing Digital Historical Data

https://leaflet-extras.github.io/leaflet-providers/preview/
https://medium.com/trabe/use-maps-from-any-provider-using-react-7a0b61a24b4b
https://ko.wikipedia.org/wiki/%ED%8B%80:%EC%9C%84%EC%B9%98_%EC%A7%80%EB%8F%84_%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD
https://react-leaflet.js.org/docs/example-vector-layers/

Some data do not have proper group

```ts
console.log(
  "node with group null",
  [...WAY_DRAW_MAP.values()].filter((way_draw) => way_draw.group === undefined)
);
```

https://data.ex.co.kr/portal/docu/docuList?datasetId=1&serviceType=&keyWord=&searchDayFrom=2014.12.01&searchDayTo=2024.03.13&CATEGORY=CO&GROUP_TR=&sId=1

https://data.ex.co.kr/openapi/basicinfo/openApiInfoM?apiId=0614&serviceType=&keyWord=&searchDayFrom=2014.12.01&searchDayTo=2024.03.13&CATEGORY=CO&GROUP_TR=&sId=695

https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%9D%98_%EA%B3%A0%EC%86%8D%EB%8F%84%EB%A1%9C

[가정: 없어지는 도로는 없을 것이다...?]
고속도로 건설공사.csv 기반으로 날짜 보기

위키백과로 노선번호/노선명/시점/종점 교차검증 (해당 문서 수정하는 사람이 많아서 믿을만할 듯)

osm <- 그리기

경인고속도로 일부 구간 지하화사업 추진
https://blog.naver.com/PostView.nhn?blogId=psc99999&logNo=221478951177&parentCategoryNo=&categoryNo=27&viewDate=&isShowPopularPosts=false&from=postView

https://nominatim.openstreetmap.org/
https://www.ex.co.kr/

#FF0000, #00FF00, hsv(240 1 1)

https://namu.wiki/w/%EC%86%8D%EB%8F%84%EC%9C%84%EB%B0%98#s-3.1
- 속도제한은 다음과 같이 가정
일반도로는 50km/h
고속도로는 100km/h

https://timjohns.ca/typescripts-hidden-feature-subtypes.html
https://toss.tech/article/typescript-type-compatibility
https://toss.tech/article/template-literal-types

찾는 방법

type system 잘 지원해주기


{이름, 생년월일}     :   조금 고유 / 조금 실용적
{이름, 대}           :      비고유 / 매우 실용적
{이름, 대, 생년월일} :   매우 고유 / 조금 실용적
{이름, index}        : 완벽한 고유 /    비실용적

{이름, 대, 생년월일} => {이름, index} : 매 임기마다 고유성을 확인하고 미리 type-system 고려해서 mapping function 제공


index의 정의
-> 고유함을 보장하기 위한 수단
-> index는 0부터 시작되며 다음 순으로 부여
    첫 당선시 투표일이 이른 사람 // `대`와 유사한 역할; 보궐선거가 예외임
    첫 당선시 득표율이 높은 사람 // 접근하기 쉬운 정보임
    첫 당선시 득표율이 높은 사람 // 접근하기 어려운 정보이나 절대 같지 않음
-> index가 0이면 생략 가능

 

{이름, 생년월일, 대}
-> 고유함
-> index는 0부터 시작되며 {첫 당선시 투표일이 이른 사람 / 첫 당선시 득표율이 높은 사람}순으로 부여
-> index가 0이면 생략 가능


이름, 대
-> unique성 보장 안 됨

이름, 대, index (0인 경우 무시; 투표일이 이르거나, 지지한 유권자 수가 많은지에 따라서 추가됨)
-> 추후 바뀔 일이 없음; 재보궐 등으로 추가는 가능하나 수정은 불필요
-> 고유함


https://www.data.go.kr/data/15112762/fileData.do