import { technocoreClient } from "../src/lib/protocol/client";

async function test() {
  const seq = 11028338;
  const since = Math.max(0, seq - 1);
  console.log(`Calling getRoomMessages('lobby', { since: ${since}, limit: 10 })...`);
  const res = await technocoreClient.getRoomMessages("lobby", { since, limit: 10 });
  console.log("Response:", res);
  const found = res.messages?.find((m) => m.seq === seq);
  console.log("Found message:", found);
}

test();
