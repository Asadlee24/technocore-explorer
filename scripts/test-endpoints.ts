async function test() {
  const urls = [
    "https://technocore.chat/rooms",
    "https://technocore.chat/r/lobby?limit=5",
    "https://technocore.chat/status"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "curl/8.4.0",
          "Accept": "*/*"
        }
      });
      console.log(`${url} -> status: ${res.status}`);
      const text = await res.text();
      console.log(text.substring(0, 150));
    } catch(e) {
      console.log(`${url} -> error:`, (e as any).message);
    }
  }
}
test();
