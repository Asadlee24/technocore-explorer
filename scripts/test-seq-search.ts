import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { ContinuumService } from "../src/lib/continuum/data-service";

async function main() {
  const t = await ContinuumService.getArchiveRecordsWithCount({ searchQuery: "10833269" });
  console.log("Search for seq 10833269:", t);
}

main().catch(console.error);
