import { PlaceName } from "./place";

const segmentData: [PlaceName, PlaceName, string][] = [
  ["구서 나들목", "동대구 갈림목", "1969-12-19"],
  ["동대구 갈림목", "대전 나들목", "1970-07-07"],
  ["대전 나들목", "천안 나들목", "1969-12-10"],
  ["천안 나들목", "오산 나들목", "1969-09-29"],
  ["오산 나들목", "수원 나들목", "1968-12-30"],
  ["수원 나들목", "신양재 나들목", "1968-12-21"],
  ["서영암 나들목", "해룡 나들목", "2012-04-27"],
  ["해룡 나들목", "서순천 나들목", "9999-12-31"],
  ["서순천 나들목", "산인 갈림목", "1973-11-14"],
  ["산인 갈림목", "창원 갈림목", "2001-11-15"],
  ["창원 갈림목", "부산 종점 | 덕천 나들목 근처", "1973-11-14"],
  ["산인 갈림목", "창원 갈림목", "1973-11-14"],
  ["냉정 갈림목", "사상 나들목", "1973-11-14"],
  ["진례 갈림목", "신항 교차로", "2017-01-13"],
  ["무안 나들목", "나주 나들목", "2007-11-8"],
  ["나주 나들목", "운수 나들목", "2008-5-28"],
  ["고서 갈림목", "옥포 갈림목", "1984-06-27"],
  ["밀양 나들목", "울주 나들목", "2013-12-20"],
  ["죽림 갈림목", "무안 나들목", "1998- 8-25"],
  ["무안 나들목", "군산 나들목", "2001-12-21"],
  ["군산 나들목", "서천 나들목", "1998-10-30"],
  ["서천 나들목", "당진 갈림목", "2001-11-10"],
  ["당진 갈림목", "안중리", "2000-11-10"],
  ["안중리", "안산 갈림목", "1994-07-06"],
  ["안산 갈림목", "일직 갈림목", "1995-12-28"],
  ["일직 갈림목", "금천 나들목", "1998-11-25"],
  ["언양 갈림목", "울산 종점 | 울산 갈림목 근처", "1969-12-29"],
  ["완주 갈림목", "장수 나들목", "2007-12-13"],
  ["장수 나들목", "장수 갈림목", "2001-11-29"],
  ["장수 갈림목", "대구 시점 | 팔공산 나들목 근처", "9999-12-31"],
  ["대구 시점 | 팔공산 나들목 근처", "포항 나들목", "2004-12-07"],
  ["서순천 나들목", "전주 나들목", "1973-11-14"],
  ["전주 나들목", "논산 갈림목", "1970-12-30"],
  ["동순천 나들목", "순천 갈림목", "2011-4-29"],
  ["순천 갈림목", "서남원 나들목", "2011-1-31"],
  ["서남원 나들목", "완주 갈림목", "2010-12-28"],
  ["당진 갈림목", "유성 갈림목", "2009-05-28"],
  ["유성 갈림목", "청주 갈림목", "9999-12-31"],
  ["청주 갈림목", "상주 갈림목", "2007-11-28"],
  ["상주 갈림목", "영덕 나들목", "2016-12-26"],
  ["아산 나들목", "천안 갈림목", "2023-09-20"],
  ["통영 나들목", "진주 갈림목", "2005-12-12"],
  ["진주 갈림목", "서진주 나들목", "1996-12-20"],
  ["서진주 나들목", "함양 나들목", "1998-10-22"],
  ["함양 나들목", "무주 나들목", "2001-11-29"],
  ["무주 나들목", "산내 갈림목", "2000-12-22"],
  ["산내 갈림목", "비룡 갈림목", "1999-09-06"],
  ["남이 갈림목", "하남 갈림목", "1987-12-03"],
  ["마장 갈림목", "산곡 갈림목", "2001-11-29"],
  ["서평택 갈림목", "안성 갈림목", "2002-12-12"],
  ["안성 갈림목", "남안성 나들목", "2007-08-31"],
  ["남안성 나들목", "대소 갈림목", "2008-11-11"],
  ["대소 갈림목", "충주 갈림목", "2013-08-12"],
  ["충주 갈림목", "동충주 나들목", "2014-10-31"],
  ["동충주 나들목", "제천 갈림목", "2015-06-30"],
  ["내서 갈림목", "현풍 갈림목", "1977-12-17"],
  ["현풍 갈림목", "김천 갈림목", "2007-11-29"],
  ["김천 갈림목", "북상주 나들목", "2001-09-07"],
  ["북상주 나들목", "충주 갈림목", "2004-12-15"],
  ["충주 갈림목", "여주 갈림목", "2002-12-20"],
  ["여주 갈림목", "북여주 나들목", "2010-09-15"],
  ["북여주 나들목", "양평 나들목", "2012-12-28"],
  ["서창 갈림목", "안산 갈림목", "1994-07-06"],
  ["안산 갈림목", "신갈 갈림목", "1991-11-29"],
  ["신갈 갈림목", "새말 나들목", "1971-12-01"],
  ["새말 나들목", "강릉 갈림목", "1975-10-14"],
  ["강서낙동강교", "대동 갈림목", "1996-06-28"],
  ["대동 갈림목", "금호 갈림목", "9999-12-31"],
  ["금호 갈림목", "안동 갈림목", "1995-08-29"],
  ["안동 갈림목", "풍기 나들목", "1999-09-16"],
  ["풍기 나들목", "제천 갈림목", "2001-12-19"],
  ["제천 갈림목", "만종 갈림목", "1995-08-29"],
  ["만종 갈림목", "홍천 나들목", "2001-08-17"],
  ["홍천 나들목", "춘천 나들목", "1995-08-29"],
  ["춘천 갈림목", "동홍천 나들목", "2009-10-30"],
  ["동홍천 나들목", "양양 갈림목", "2017-06-30"],
  ["강일 갈림목", "춘천 갈림목", "2009-07-15"],
  ["근덕 나들목", "동해 나들목", "2016-09-09"],
  ["동해 나들목", "남양양 나들목", "1975-10-14"],
  ["남양양 나들목", "하조대 나들목", "2009-11-27"],
  ["하조대 나들목", "양양 나들목", "2012-12-21"],
  ["양양 나들목", "속초 나들목", "2016-11-24"],
  ["속초 나들목", "울산 갈림목", "9999-12-31"],
  ["울산 갈림목", "범서 나들목", "2015-12-30"],
  ["범서 나들목", "남경주 나들목", "2015-12-30"],
  ["남경주 나들목", "동경주 나들목", "2016-06-30"],
  ["동경주 나들목", "남포항 나들목", "2015-12-30"],
  ["퇴계원 나들목", "판교 갈림목", "1991-11-29"],
  ["판교 갈림목", "일산 나들목", "1999-11-26"],
  ["퇴계원 나들목", "일산 나들목", "2007-12-28"],
  ["능해 나들목", "서창 갈림목", "1994-07-06"],
  ["서창 갈림목", "삼막 나들목", "1994-07-06"],
  ["공항신도시 갈림목", "학익 갈림목", "2009-10-19"],
  ["석수 나들목", "여수대로 나들목", "2017-09-27"],
  ["신불 나들목", "북로 갈림목", "2000-11-21"],
  ["서인천 나들목", "신월 나들목", "1968-12-21"],
  ["동서천 나들목", "서공주 갈림목", "2009-05-28"],
  ["익산 갈림목", "완주 갈림목", "2007-12-13"],
  ["논산 갈림목", "회덕 갈림목", "1970-12-30"],
  ["고창 갈림목", "장성 갈림목", "2007-12-13"],
  ["장성 갈림목", "담양 나들목", "2006-12-07"],
  ["서대전 갈림목", "산내 갈림목", "1999-09-06"],
  ["현풍 갈림목", "금호 갈림목", "1977-12-17"],
  ["남광산 나들목", "남장성 갈림목", "2011-12-30"],
  ["김해 갈림목", "대동 갈림목", "2014-12-16"],
  ["대동 갈림목", "남양산 나들목", "1996-06-28"],
  ["남양산 나들목", "양산 갈림목", "1996-05-01"],
  ["진영 갈림목", "노포 갈림목", "2018-02-07"],
  ["노포 갈림목", "기장 갈림목", "2017-12-28"],
  ["달서 나들목", "동명동호 나들목", "2022-03-31"],
  ["동명동호 나들목", "서변 나들목", "9999-12-31"],
  ["서변 나들목", "상매 갈림목", "2022-03-31"],
  ["남논산 요금소", "천안 갈림목", "2002-12-23"],
  ["남구리 나들목", "포천 나들목", "2017-06-30"],
  ["포천 나들목", "신북 나들목", "9999-12-31"],
  ["옥산 갈림목", "오창 갈림목", "2018-01-14"],
  ["경기광주 갈림목", "원주 갈림목", "2014-12-16"],
  ["김해부산 요금소", "동대구 나들목", "2006-01-25"],
  ["동부산 나들목", "울산 갈림목", "2008-12-29"],
  ["서평택 갈림목", "군자 갈림목", "2013-3-28"],
  ["흥덕 나들목", "헌릉 나들목", "2009-07-01"],
  ["서오산 갈림목", "안녕 나들목", "2009-10-29"],
  ["낙동 갈림목", "영천 갈림목", "2017-06-28"],
];
