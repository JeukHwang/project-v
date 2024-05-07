import { district21 } from "./제21대/district";
import { geometry21 } from "./제21대/geometry";
import { person21 } from "./제21대/person";

async function build21() {
  district21.build();
  geometry21.build();
  await person21.build();
}
