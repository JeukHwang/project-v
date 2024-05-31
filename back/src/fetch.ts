import axios from "axios";
import { writeFileSync } from "fs";

// Utility function to make a POST request and return the JSON result
async function postRequest(url, data, cookie) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: cookie,
        DNT: "1",
        Origin: "http://info.nec.go.kr",
        Referer: "http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    return response.data.jsonResult.body;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return [];
  }
}

// Fetch all election types for a given election session
async function fetchElectionTypes(electionId, electionCode, cookie) {
  const url =
    "http://info.nec.go.kr/bizcommon/selectbox/selectbox_getSubElectionTypeJson.json";
  const data = new URLSearchParams({
    electionId: electionId,
    electionCode: electionCode,
    electionType: "2",
  }).toString();
  return postRequest(url, data, cookie);
}

// Fetch all cities for a given election type
async function fetchCities(electionId, electionCode, subElectionCode, cookie) {
  const url =
    "http://info.nec.go.kr/bizcommon/selectbox/selectbox_cityCodeBySgJson_Old.json";
  const data = new URLSearchParams({
    electionId: electionId,
    subElectionCode: subElectionCode,
    electionCode: electionCode,
  }).toString();
  return postRequest(url, data, cookie);
}

// Fetch all districts for a given city
async function fetchDistricts(
  electionId,
  electionCode,
  cityCode,
  subElectionCode,
  cookie
) {
  const url =
    "http://info.nec.go.kr/bizcommon/selectbox/selectbox_townCodeBySgJson_Old.json";
  const data = new URLSearchParams({
    electionId: electionId,
    electionCode: electionCode,
    cityCode: cityCode,
    subElectionCode: subElectionCode,
  }).toString();
  return postRequest(url, data, cookie);
}

// Main function to perform BFS traversal and fetch all districts
async function fetchAllDistricts(cookie) {
  const electionCodes = [
    ["0020240410", "제22대"],
    ["20200415", "제21대"],
    ["20160413", "제20대"],
    ["20120411", "제19대"],
    ["20080409", "제18대"],
  ];
  const electionId = "0000000000";

  const d = [];

  for (const [electionCode, electionCodeName] of electionCodes) {
    const electionTypes = await fetchElectionTypes(
      electionId,
      electionCode,
      cookie
    );

    for (const electionType of electionTypes) {
      const subElectionCode = electionType.CODE;
      const cities = await fetchCities(
        electionId,
        electionCode,
        subElectionCode,
        cookie
      );

      for (const city of cities) {
        const cityCode = city.CODE;
        const districts = await fetchDistricts(
          electionId,
          electionCode,
          cityCode,
          subElectionCode,
          cookie
        );

        for (const district of districts) {
          d.push({
            electionCode: electionCode,
            electionCodeName: electionCodeName,
            electionType: electionType.NAME,
            city: city.NAME,
            district: district.NAME,
          });
        }
      }
    }
  }

  writeFileSync("fetch.txt", JSON.stringify(d, null, 2), "utf-8");
}

// Replace with your actual cookie value
const cookie =
  "WMONID=-04f6tYl2gi; JSESSIONID=7WY48s5IKlkqEPS0fMOZipRHweij10BhStNVd0JZMZokjzXOzwCsIwFbVycSTwEL.elecapp7_servlet_engine2";
fetchAllDistricts(cookie);
