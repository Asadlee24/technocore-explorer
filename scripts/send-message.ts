import { ContinuumService } from "../src/lib/continuum/data-service";

async function main() {
  const room = "lobby";
  const nick = "asadlee";
  const uniqueCode = `ASAD_EXPLORER_${Date.now()}`;
  const text = `Hello from Asad Lee! Continuum Archive verified test [${uniqueCode}]`;

  console.log(`Sending message from '${nick}' to /r/${room}...`);
  const postRes = await fetch(`https://technocore.chat/r/${room}`, {
    method: "POST",
    headers: {
      "User-Agent": "curl/8.4.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: nick,
      text,
    }),
  });

  const reply = await postRes.text();
  console.log("Protocol response:", reply);

  // Now search for our message in Continuum Archive
  console.log(`\nSearching for '${uniqueCode}' in Continuum Archive...`);
  const result = await ContinuumService.getArchiveRecordsWithCount({
    room: "lobby",
    searchQuery: uniqueCode,
    limit: 5,
  });

  console.log("\nVerified Archive Search Result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
