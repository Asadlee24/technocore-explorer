import { Metadata } from "next";
import { PayloadDecoder } from "@/components/decoder/PayloadDecoder";

export const metadata: Metadata = {
  title: "Cryptographic Byte & Payload Hex Decoder | Technocore Explorer V2",
  description:
    "Dissect W3C did:key multicodec prefixes, Ed25519 64-byte scalar signatures, control characters, and Base58/Hex encodings.",
};

export default function DecoderPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PayloadDecoder />
    </div>
  );
}
