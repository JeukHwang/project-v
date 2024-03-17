import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function geocode(query: string): Promise<[number, number]> {
  const response = await axios.get(
    "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode",
    {
      params: { query },
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_API_KEY_ID,
        "X-NCP-APIGW-API-KEY": process.env.NAVER_API_KEY,
      },
    }
  );
  console.assert(response.status === 200, response);
  console.log(response.data);
//   return [response.data.addresses[0].y, response.data.addresses[0].x];
}
