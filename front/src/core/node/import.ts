import ICJC_JSON from "../../../../data/highway/icjc_v4.json";
import { ICNode, JCNode } from "./type";

export const { IC, JC } = (ICJC_JSON ?? { IC: [], JC: [] }) as unknown as {
  IC: ICNode[];
  JC: JCNode[];
};
