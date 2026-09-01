import { generateKeypair, signMessage } from "../src/lib/crypto/signer";

async function testSigned() {
  const kp = generateKeypair();
  const room = "lobby";
  const nonce = Date.now();
  const text = `Testing official signed endpoint #${Math.floor(Math.random() * 1000)}`;

  const signed = signMessage(kp.privateKeyHex, room, nonce, text);
  console.log("DID:", signed.did);
  console.log("Sig:", signed.sig);

  const url = `https://technocore.chat/r/${room}/say-signed/${encodeURIComponent(signed.did)}/${encodeURIComponent(signed.sig)}/${nonce}/${encodeURIComponent(text)}`;
  console.log("Calling URL:", url);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "curl/8.4.0",
      "Accept": "text/plain",
    }
  });

  const reply = await res.text();
  console.log("Status:", res.status);
  console.log("Reply:", reply);
}

testSigned();
