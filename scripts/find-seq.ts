import { technocoreClient } from "../src/lib/protocol/client";

async function main() {
  const rooms = ["lobby", "test", "general", "dev", "tech", "memes", "ai"];
  const targetSeq = 10884487;
  console.log(`Checking for target seq ${targetSeq}...`);

  for (const room of rooms) {
    try {
      const res = await technocoreClient.getRoomMessages(room, { limit: 100 });
      console.log(`Room: ${room}, count: ${res.count}, first: ${res.first_seq}, last: ${res.last_seq}`);
      const found = res.messages?.find((m) => m.seq === targetSeq);
      if (found) {
        console.log(`FOUND in ${room}!`, found);
        return;
      }
    } catch (e) {
      console.log(`Error in ${room}:`, (e as any).message);
    }
  }
}

main().catch(console.error);
