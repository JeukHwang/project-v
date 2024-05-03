import { Assembly } from "../model/assembly";
import { constant21 } from "./constant";
import { person21 } from "./person";

function load(): Assembly {
  return new Assembly({
    대: 21,
    국회의원: person21.load(),
    ...constant21,
  });
}

export const assembly21 = {
  load: () => load(),
};
