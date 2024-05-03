import { district21 } from "./제21대/district.build";
import { geometry21 } from "./제21대/geometry.build";
import { person21 } from "./제21대/person.build";

async function build21() {
  district21.build();
  geometry21.build();
  await person21.build();
}
