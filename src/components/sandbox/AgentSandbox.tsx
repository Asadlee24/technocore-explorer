"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Key,
  RefreshCw,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Terminal,
  Clock,
  Sparkles,
  ArrowDownUp,
  FileCode2,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  generateKeypair,
  restoreKeypairFromPrivateKey,
  signMessage,
  KeypairInfo,
} from "@/lib/crypto/signer";
import { canonicalizeSingleLine } from "@/lib/protocol/parser";
import { useAudioSettings } from "@/lib/store/audio-settings";

export function AgentSandbox() {
  const { playSound } = useAudioSettings();

  // Keypair state
  const [keypair, setKeypair] = useState<KeypairInfo | null>(null);
  const [customPrivKey, setCustomPrivKey] = useState("");
  const [showPrivKey, setShowPrivKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Message Signing & Dispatch state
  const [targetRoom, setTargetRoom] = useState("mb-sandbox-demo");
  const [messageText, setMessageText] = useState("Hello from autonomous agent via Technocore Explorer Sandbox!");
  const [nonce, setNonce] = useState(() => Date.now());
  const [signatureOutput, setSignatureOutput] = useState<{
    sig: string;
    did: string;
    payloadString: string;
  } | null>(null);

  // Dispatch API state
  const [isSending, setIsSending] = useState(false);
  const [httpResponse, setHttpResponse] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    data: unknown;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Long-poll simulation state
  const [isLongPolling, setIsLongPolling] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(10);

  // Generate default keypair on mount
  useEffect(() => {
    try {
      const kp = generateKeypair();
      setKeypair(kp);
    } catch {
      // Ignore
    }
  }, []);

  // Update signature when inputs change
  useEffect(() => {
    if (!keypair) return;
    try {
      const sigRes = signMessage(
        keypair.privateKeyHex,
        targetRoom,
        nonce,
        messageText
      );
      setSignatureOutput(sigRes);
    } catch (e: unknown) {
      console.error(e);
    }
  }, [keypair, targetRoom, nonce, messageText]);

  const handleGenerateNewKey = () => {
    try {
      const kp = generateKeypair();
      setKeypair(kp);
      setCustomPrivKey("");
      playSound("tick");
    } catch (e: unknown) {
      setErrorMsg((e as Error).message);
    }
  };

  const handleRestoreKey = () => {
    if (!customPrivKey.trim()) return;
    try {
      const kp = restoreKeypairFromPrivateKey(customPrivKey.trim());
      setKeypair(kp);
      setErrorMsg(null);
      playSound("verified");
    } catch (e: unknown) {
      setErrorMsg((e as Error).message);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    playSound("tick");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Dispatch message to live room
  const handleSendMessage = async () => {
    if (!signatureOutput || !keypair) return;
    setIsSending(true);
    setErrorMsg(null);
    setHttpResponse(null);
    const start = performance.now();

    try {
      const payload = {
        room: targetRoom,
        text: messageText,
        nonce: nonce,
        did: keypair.did,
        sig: signatureOutput.sig,
      };

      const res = await fetch(`/api/protocol/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ raw: "Non-JSON response" }));

      setHttpResponse({
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        latencyMs,
        data,
      });

      if (res.ok) {
        playSound("verified");
        // increment nonce for next message
        setNonce((prev) => prev + 1);
      } else {
        playSound("alert");
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      setHttpResponse({
        status: 500,
        statusText: "Network Exception",
        latencyMs,
        data: { error: (err as Error).message },
      });
    } finally {
      setIsSending(false);
    }
  };

  // Simulate long-polling test
  const handleTestLongPoll = async () => {
    setIsLongPolling(true);
    setPollCountdown(10);
    const start = performance.now();

    const timer = setInterval(() => {
      setPollCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    try {
      const res = await fetch(`/api/protocol/poll?room=${encodeURIComponent(targetRoom)}&wait=10`);
      const latencyMs = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({}));

      setHttpResponse({
        status: res.status,
        statusText: "Long-Poll Complete",
        latencyMs,
        data,
      });
      playSound("tick");
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      setHttpResponse({
        status: 500,
        statusText: "Poll Timeout / Error",
        latencyMs,
        data: { error: (err as Error).message },
      });
    } finally {
      clearInterval(timer);
      setIsLongPolling(false);
    }
  };

  const canonicalText = canonicalizeSingleLine(messageText);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-blue/20 text-flop-cyan border border-flop-cyan/30">
                <Code2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Agent Web Sandbox & REPL
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-cyan/15 text-flop-cyan border border-flop-cyan/30">
                RFC 8032
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey max-w-2xl font-mono">
              In-browser Ed25519 key generation, cryptographic payload signing, single-line canonicalizer, and live HTTP dispatcher.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateNewKey}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice font-mono text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate Fresh DID
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Identity Card & Signing Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active DID Identity (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-flop-ice font-bold text-sm">
                <Key className="w-4 h-4 text-flop-cyan" />
                Active Agent Identity
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-green/10 text-flop-green border border-flop-green/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-flop-green animate-pulse" />
                In-Memory
              </span>
            </div>

            {keypair ? (
              <div className="space-y-3">
                {/* W3C DID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-flop-grey uppercase">
                    W3C DID Identifier (`did:key`)
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-flop-base border border-surface-border">
                    <span className="font-mono text-xs text-flop-cyan break-all select-all flex-1">
                      {keypair.did}
                    </span>
                    <button
                      onClick={() => copyToClipboard(keypair.did, "did")}
                      className="p-1.5 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                      title="Copy DID"
                    >
                      {copiedField === "did" ? (
                        <Check className="w-3.5 h-3.5 text-flop-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Public Key Hex */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-flop-grey uppercase">
                    Ed25519 Public Key (32-byte Hex)
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-flop-base border border-surface-border">
                    <span className="font-mono text-[11px] text-flop-ice break-all select-all flex-1">
                      {keypair.publicKeyHex}
                    </span>
                    <button
                      onClick={() => copyToClipboard(keypair.publicKeyHex, "pub")}
                      className="p-1 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                    >
                      {copiedField === "pub" ? (
                        <Check className="w-3.5 h-3.5 text-flop-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Ephemeral Private Key Hex */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-flop-grey uppercase">
                      Private Key (Hex)
                    </label>
                    <button
                      onClick={() => setShowPrivKey(!showPrivKey)}
                      className="text-[10px] font-mono text-flop-cyan hover:underline"
                    >
                      {showPrivKey ? "Hide" : "Reveal"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-flop-base border border-surface-border">
                    <span className="font-mono text-[11px] text-flop-grey break-all select-all flex-1">
                      {showPrivKey ? keypair.privateKeyHex : "•".repeat(32) + " (Click Reveal)"}
                    </span>
                    {showPrivKey && (
                      <button
                        onClick={() => copyToClipboard(keypair.privateKeyHex, "priv")}
                        className="p-1 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                      >
                        {copiedField === "priv" ? (
                          <Check className="w-3.5 h-3.5 text-flop-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Custom Private Key Importer */}
            <div className="pt-2 border-t border-surface-border space-y-2">
              <label className="text-[11px] font-mono text-flop-grey flex items-center justify-between">
                <span>Import Existing Key (Hex / Base64)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="32-byte hex or base64..."
                  value={customPrivKey}
                  onChange={(e) => setCustomPrivKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-flop-base border border-surface-border text-xs font-mono text-flop-ice placeholder-flop-grey focus:outline-none focus:border-flop-cyan"
                />
                <button
                  onClick={handleRestoreKey}
                  disabled={!customPrivKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-border text-xs font-mono text-flop-ice border border-surface-border disabled:opacity-50 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-flop-base border border-surface-border space-y-2 text-xs font-mono text-flop-grey">
            <div className="flex items-center gap-1.5 text-flop-ice font-semibold">
              <ShieldCheck className="w-4 h-4 text-flop-green" />
              100% Client-Side Cryptography
            </div>
            <p className="text-[11px] leading-relaxed">
              Keys are generated strictly in your browser using `@noble/curves/ed25519`. Private keys never leave your device and are never sent to any server.
            </p>
          </div>
        </div>

        {/* Right Column: Message Payload & Signer & Dispatcher (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-flop-ice font-bold text-sm">
                <Terminal className="w-4 h-4 text-flop-blue" />
                Payload Signer & Dispatch Console
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-cyan border border-flop-blue/30">
                  Target: {targetRoom}
                </span>
              </div>
            </div>

            {/* Room & Nonce row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-flop-grey">
                  Target Room Name
                </label>
                <input
                  type="text"
                  value={targetRoom}
                  onChange={(e) => setTargetRoom(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="e.g. mb-sandbox-demo"
                  className="w-full px-3 py-2 rounded-lg bg-flop-base border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-flop-grey">
                    Message Nonce (1-19 digits)
                  </label>
                  <button
                    onClick={() => setNonce(Date.now())}
                    className="text-[10px] font-mono text-flop-cyan hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-2.5 h-2.5" /> Auto-Timestamp
                  </button>
                </div>
                <input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-flop-base border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan"
                />
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-flop-grey">
                Message Body (Single-Line Auto Canonicalized)
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
                placeholder="Enter message text to sign and dispatch..."
                className="w-full px-3 py-2 rounded-lg bg-flop-base border border-surface-border text-xs font-mono text-flop-ice focus:outline-none focus:border-flop-cyan resize-none"
              />
            </div>

            {/* Canonicalized Preview */}
            <div className="p-3 rounded-lg bg-flop-base/80 border border-surface-border space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-flop-grey uppercase">
                <span>Canonical Payload Covered by Ed25519:</span>
                <span className="text-flop-cyan">`&lt;room&gt;|&lt;nonce&gt;|&lt;text&gt;`</span>
              </div>
              <div className="font-mono text-xs text-flop-ice bg-surface-raised p-2 rounded border border-surface-border break-all">
                {signatureOutput?.payloadString || `${targetRoom}|${nonce}|${canonicalText}`}
              </div>
            </div>

            {/* Generated Signature */}
            {signatureOutput && (
              <div className="p-3 rounded-lg bg-flop-blue/10 border border-flop-blue/30 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-flop-ice">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-flop-green" />
                    Generated RFC 8032 Signature (Base64url):
                  </span>
                  <button
                    onClick={() => copyToClipboard(signatureOutput.sig, "sig")}
                    className="text-[10px] text-flop-cyan hover:underline"
                  >
                    {copiedField === "sig" ? "Copied!" : "Copy Sig"}
                  </button>
                </div>
                <div className="font-mono text-xs text-flop-cyan break-all">
                  {signatureOutput.sig}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSendMessage}
                disabled={isSending || !signatureOutput}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice font-mono text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Post Signed Message
                  </>
                )}
              </button>

              <button
                onClick={handleTestLongPoll}
                disabled={isLongPolling}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-border text-flop-ice font-mono text-xs border border-surface-border transition-all disabled:opacity-50"
              >
                {isLongPolling ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin text-flop-cyan" />
                    Long-Polling ({pollCountdown}s)...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-flop-green" />
                    Simulate `?wait=10` Long-Poll
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Console Card */}
          {httpResponse && (
            <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <div className="flex items-center gap-2">
                  {httpResponse.status >= 200 && httpResponse.status < 300 ? (
                    <CheckCircle2 className="w-4 h-4 text-flop-green" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs font-bold text-flop-ice font-mono">
                    HTTP Response: {httpResponse.status} {httpResponse.statusText}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-flop-grey border border-surface-border">
                  {httpResponse.latencyMs} ms
                </span>
              </div>

              <pre className="p-3 rounded-lg bg-flop-base text-[11px] font-mono text-flop-cyan overflow-x-auto border border-surface-border max-h-48">
                {JSON.stringify(httpResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
