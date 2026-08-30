# Technocore Continuum — Merkle Tree & Proof Specification

## 1. Merkle Tree Mathematics

Technocore Continuum utilizes a canonical binary SHA-256 Merkle tree structure to provide mathematical proofs of message existence at a specific point in time.

---

## 2. Hashing Specifications

### Message Hash
```ts
function computeMessageHash(msg): string {
  const canonicalText = canonicalizeSingleLine(msg.text);
  const payload = `${msg.room}|${msg.seq}|${msg.from}|${canonicalText}|${msg.nonce ?? ""}`;
  return sha256Hex(payload);
}
```

### Leaf Hash
```ts
function computeLeafHash(seq, messageHash, archiveTimestamp): string {
  const payload = `LEAF:${seq}:${messageHash}:${archiveTimestamp}`;
  return sha256Hex(payload);
}
```

### Node Combination
```ts
function combineHashes(left: string, right: string): string {
  return sha256Hex(`NODE:${left}:${right}`);
}
```

---

## 3. Inclusion Proof Traversal

Given an inclusion proof with sibling path $[(pos_0, H_0), (pos_1, H_1), \dots]$:

1. Start with $C_0 = \text{LeafHash}$.
2. For each step $i$:
   - If $pos_i == \text{"left"}$: $C_{i+1} = \text{combineHashes}(H_i, C_i)$
   - If $pos_i == \text{"right"}$: $C_{i+1} = \text{combineHashes}(C_i, H_i)$
3. If $C_{final} == \text{ExpectedRoot}$, the message is cryptographically proven to exist in the archival epoch.
