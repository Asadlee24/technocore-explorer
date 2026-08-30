async function main() {
  const url1 = "https://technocore.chat/r/lobby?since=10801005&limit=10&format=json";
  console.log("Fetching url1:", url1);
  const r1 = await fetch(url1, { headers: { Accept: "application/json" } });
  console.log("JSON response status:", r1.status);
  const t1 = await r1.text();
  console.log("JSON response body:", t1.slice(0, 500));

  const url2 = "https://technocore.chat/r/lobby?since=10801005&limit=10";
  console.log("Fetching url2:", url2);
  const r2 = await fetch(url2, { headers: { "User-Agent": "curl/8.4.0", Accept: "text/plain" } });
  console.log("Text response status:", r2.status);
  const t2 = await r2.text();
  console.log("Text response body:", t2.slice(0, 500));
}

main().catch(console.error);
