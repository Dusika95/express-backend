import * as dotenv from "dotenv";
import { migrateToLatest } from "../src/migrate";

dotenv.config({ path: "./.test.env" });

(async function () {
  await migrateToLatest();
})();
