import { technocoreClient } from "../src/lib/protocol/client";

async function main() {
  console.log("Fetching lobby with since=10801005...");
  const res = await technocoreClient.getRoomMessages("lobby", { since: 10801005, limit: 10 });
  console.log("Result:", res);
  for (const m of res.messages) {
    console.log(`Seq: ${m.seq}, From: ${m.from}, Text: ${m.text}`);
  }
}

main().catch(console.error);
