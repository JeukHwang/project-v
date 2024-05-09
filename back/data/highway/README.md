# Reference

## Processed

## Raw

### 국토교통부\_일반국도 도로중심선\_20230906

2024.05.05
~~출처~~

https://github.com/vuski/admdongkor

```sh
npx shp2json ./highway/raw/구역의도형_전체분_서울특별시/TL_SCCO_GEMD.shp --encoding euc-kr > test3.json
npx shp2json ./highway/raw/국토교통부_일반국도_도로중심선_20230906/road.shp --encoding euc-kr > test4.json
npx shp2json ./highway/raw/국토교통부_일반국도_도로중심선_20230906/road.shp --encoding euc-kr -n > test4.shp.json
npx dbf2json ./highway/raw/국토교통부_일반국도_도로중심선_20230906/road.dbf --encoding euc-kr -n > test4.dbf.json
npx shp2json ./data/highway/raw/구역의도형_전체분_서울특별시/TL_SCCO_GEMD.shp --encoding euc-kr > seoul.shp.json
npx dbf2json ./data/highway/raw/구역의도형_전체분_서울특별시/TL_SCCO_GEMD.dbf --encoding euc-kr > seoul.dbf.json
```

2530 -
```text
0010,��μ�,253.3000,127.622493639,36.292409254,255918.725016,410670.688684
```
https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1TS2001&conn_path=I2

중앙선:2/2
대구외곽순환선

> 헤맨 만큼 내 땅이다