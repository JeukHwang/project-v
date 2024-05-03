import { saveJson } from "./util";
import { build } from "./제21대/person.build";
import { test } from "./제21대/person.test";

export async function update21(): Promise<void> {
  const peopleData = build();
  await test(peopleData);
  saveJson(peopleData, "../election/processed/person21.json");
}
update21();
