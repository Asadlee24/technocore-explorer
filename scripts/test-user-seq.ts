import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { ContinuumService } from "../src/lib/continuum/data-service";

async function main() {
  const targetSeq = 11028338;
  console.log(`Searching for sequence ${targetSeq}...`);
  const res = await ContinuumService.getArchiveRecordsWithCount({
    searchQuery: String(targetSeq),
  });
  console.log("Result:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
