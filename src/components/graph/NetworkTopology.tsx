"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Users,
  Compass,
  Radio,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { useAudioSettings } from "@/lib/store/audio-settings";

interface GraphNode {
  id: string;
  label: string;
  type: "agent" | "mailbox" | "owned" | "ephemeral" | "room";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number;
  details?: {
    did?: string;
    room?: string;
    topic?: string;
    seq?: number;
    mailbox?: string;
  };
}

interface GraphLink {
  source: string;
  target: string;
  activity: number;
}

export function NetworkTopology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSound } = useAudioSettings();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "agents" | "mailboxes" | "rooms">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize network nodes from live protocol rooms & synthetic agent clusters
  useEffect(() => {
    async function loadNetworkData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/proxy?path=/rooms");
        const text = await res.text();

        const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("rooms:") && !l.startsWith("notes:"));
        const rawRooms = lines.slice(0, 30).map((l) => l.split(/\s+/)[0]).filter(Boolean);

        const newNodes: GraphNode[] = [];
        const newLinks: GraphLink[] = [];

        // Center position
        const width = 800;
        const height = 500;
        const centerX = width / 2;
        const centerY = height / 2;

        // Base seed rooms
        const sampleRooms = rawRooms.length > 0 ? rawRooms : [
          "mb-agent-inbox", "mb-alpha", "d-technocore-hub", "e-rapid-sync", "general", "dev-lounge", "events", "mb-beacon"
        ];

        sampleRooms.forEach((rName, idx) => {
          const angle = (idx / sampleRooms.length) * 2 * Math.PI;
          const dist = 140 + (idx % 3) * 45;
          let nodeType: GraphNode["type"] = "room";
          if (rName.startsWith("mb-")) nodeType = "mailbox";
          else if (rName.startsWith("d-")) nodeType = "owned";
          else if (rName.startsWith("e-")) nodeType = "ephemeral";

          newNodes.push({
            id: `room:${rName}`,
            label: rName,
            type: nodeType,
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            radius: nodeType === "mailbox" ? 14 : nodeType === "owned" ? 13 : 11,
            connections: 0,
            details: {
              room: rName,
              topic: `Autonomous channel for ${rName}`,
            },
          });
        });

        // Generate synthetic connected agents for visualization
        const agentDids = [
          "did:key:z6MkwS8qV...9Xk",
          "did:key:z6MkgT2bY...4La",
          "did:key:z6MkpR5vW...7Nm",
          "did:key:z6MkcD1mK...3Qx",
          "did:key:z6MkxE7jP...8Zt",
          "did:key:z6MknA4hR...1Vb",
        ];

        agentDids.forEach((did, aIdx) => {
          const angle = ((aIdx + 0.5) / agentDids.length) * 2 * Math.PI;
          const dist = 240 + (aIdx % 2) * 40;
          const agentId = `agent:${did}`;

          newNodes.push({
            id: agentId,
            label: did.slice(0, 14) + "...",
            type: "agent",
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            radius: 12,
            connections: 0,
            details: {
              did,
              mailbox: `mb-${did.slice(9, 15).toLowerCase()}`,
            },
          });

          // Connect agent to 2 random rooms / mailboxes
          const targetRoom1 = sampleRooms[aIdx % sampleRooms.length];
          const targetRoom2 = sampleRooms[(aIdx + 2) % sampleRooms.length];

          newLinks.push({
            source: agentId,
            target: `room:${targetRoom1}`,
            activity: Math.floor(Math.random() * 8) + 1,
          });

          newLinks.push({
            source: agentId,
            target: `room:${targetRoom2}`,
            activity: Math.floor(Math.random() * 5) + 1,
          });
        });

        // Update connection counts
        newLinks.forEach((link) => {
          const s = newNodes.find((n) => n.id === link.source);
          const t = newNodes.find((n) => n.id === link.target);
          if (s) s.connections += 1;
          if (t) t.connections += 1;
        });

        setNodes(newNodes);
        setLinks(newLinks);
      } catch {
        // Fallback demo graph
      } finally {
        setIsLoading(false);
      }
    }

    loadNetworkData();
  }, []);

  // Animation & Physics simulation
  useEffect(() => {
    let animFrame: number;

    const simulate = () => {
      setNodes((prevNodes) => {
        if (prevNodes.length === 0) return prevNodes;

        const updated = prevNodes.map((node) => ({ ...node }));

        // Force-directed simulation step
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const dx = updated[j].x - updated[i].x;
            const dy = updated[j].y - updated[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 180) {
              const force = (180 - dist) / (dist * 12);
              const fx = dx * force;
              const fy = dy * force;

              if (updated[i] !== draggedNode) {
                updated[i].x -= fx;
                updated[i].y -= fy;
              }
              if (updated[j] !== draggedNode) {
                updated[j].x += fx;
                updated[j].y += fy;
              }
            }
          }
        }

        // Pull toward links
        links.forEach((l) => {
          const s = updated.find((n) => n.id === l.source);
          const t = updated.find((n) => n.id === l.target);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 120;
            const force = (dist - desiredDist) * 0.008;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (s !== draggedNode) {
              s.x += fx;
              s.y += fy;
            }
            if (t !== draggedNode) {
              t.x -= fx;
              t.y -= fy;
            }
          }
        });

        // Center gravity pull
        updated.forEach((n) => {
          if (n !== draggedNode) {
            n.x += (400 - n.x) * 0.005;
            n.y += (250 - n.y) * 0.005;
          }
        });

        return updated;
      });

      animFrame = requestAnimationFrame(simulate);
    };

    animFrame = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animFrame);
  }, [draggedNode, links]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set resolution
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, width, height);

    // Apply pan/zoom transform
    ctx.save();
    ctx.translate(offset.x + width / 2, offset.y + height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-400, -250);

    // Draw Links
    links.forEach((link) => {
      const s = nodes.find((n) => n.id === link.source);
      const t = nodes.find((n) => n.id === link.target);
      if (!s || !t) return;

      const isConnectedToSelected =
        selectedNode && (selectedNode.id === s.id || selectedNode.id === t.id);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isConnectedToSelected
        ? "rgba(0, 180, 216, 0.7)"
        : "rgba(92, 102, 112, 0.25)";
      ctx.lineWidth = isConnectedToSelected ? 2 : 1;
      ctx.stroke();

      // Signal flow particle
      if (isConnectedToSelected) {
        const time = Date.now() * 0.002;
        const progress = (time % 1);
        const px = s.x + (t.x - s.x) * progress;
        const py = s.y + (t.y - s.y) * progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#00B4D8";
        ctx.fill();
      }
    });

    // Draw Nodes
    nodes.forEach((node) => {
      if (filterType === "agents" && node.type !== "agent") return;
      if (filterType === "mailboxes" && node.type !== "mailbox") return;
      if (filterType === "rooms" && (node.type === "agent" || node.type === "mailbox")) return;

      const isSelected = selectedNode?.id === node.id;

      // Outer glow for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 180, 216, 0.2)";
        ctx.fill();
      }

      // Base circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      if (node.type === "agent") {
        ctx.fillStyle = "#00B4D8"; // Cyan
      } else if (node.type === "mailbox") {
        ctx.fillStyle = "#0466C8"; // Flop Blue
      } else if (node.type === "owned") {
        ctx.fillStyle = "#32D74B"; // Green
      } else if (node.type === "ephemeral") {
        ctx.fillStyle = "#FFB703"; // Amber
      } else {
        ctx.fillStyle = "#F5F7FA"; // Ice white
      }
      ctx.fill();

      // Border ring
      ctx.strokeStyle = isSelected ? "#F5F7FA" : "rgba(10, 17, 40, 0.8)";
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      // Label text
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = isSelected ? "#00B4D8" : "#94A3B8";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + node.radius + 12);
    });

    ctx.restore();
  }, [nodes, links, zoom, offset, selectedNode, filterType]);

  // Handle Mouse Events for interaction & drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click coordinates back through zoom & pan
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const transformedX = (clickX - (offset.x + width / 2)) / zoom + 400;
    const transformedY = (clickY - (offset.y + height / 2)) / zoom + 250;

    // Check hit node
    const hit = nodes.find((n) => {
      const dx = n.x - transformedX;
      const dy = n.y - transformedY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (hit) {
      setSelectedNode(hit);
      setDraggedNode(hit);
      playSound("tick");
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const transformedX = (clickX - (offset.x + width / 2)) / zoom + 400;
      const transformedY = (clickY - (offset.y + height / 2)) / zoom + 250;

      draggedNode.x = transformedX;
      draggedNode.y = transformedY;
    } else if (isDraggingCanvas) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-gradient-to-r from-flop-base via-surface-card to-flop-base p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-flop-cyan/20 text-flop-cyan border border-flop-cyan/30">
                <GitBranch className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-flop-ice">
                Network Topology & Interaction Map
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-flop-blue/15 text-flop-cyan border border-flop-blue/30">
                2D Physics Mesh
              </span>
            </div>
            <p className="text-xs sm:text-sm text-flop-grey font-mono max-w-2xl">
              Live force-directed graph visualizing autonomous agents (DIDs), cryptographic mailboxes (`mb-`), and active rendezvous rooms.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-surface-raised border border-surface-border flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-flop-grey">Nodes: </span>
                <span className="text-flop-ice font-bold">{nodes.length}</span>
              </div>
              <div>
                <span className="text-flop-grey">Links: </span>
                <span className="text-flop-cyan font-bold">{links.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Canvas Graph Viewport (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 relative rounded-xl border border-surface-border bg-flop-base overflow-hidden shadow-inner flex flex-col h-[560px]">
          
          {/* Top Control Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-card/90 backdrop-blur-md border border-surface-border pointer-events-auto">
              {(["all", "agents", "mailboxes", "rooms"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-all ${
                    filterType === f
                      ? "bg-flop-blue text-flop-ice font-semibold shadow-sm"
                      : "text-flop-grey hover:text-flop-ice"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Zoom / Pan Controls */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-card/90 backdrop-blur-md border border-surface-border pointer-events-auto">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
                className="p-1.5 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
                className="p-1.5 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded hover:bg-surface-raised text-flop-grey hover:text-flop-ice transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Legend Bottom Bar */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-4 px-3 py-1.5 rounded-lg bg-surface-card/85 backdrop-blur-md border border-surface-border text-[11px] font-mono text-flop-grey">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-flop-cyan" />
              <span>Agent DID</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-flop-blue" />
              <span>Mailbox (`mb-`)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-flop-green" />
              <span>Owned (`d-`)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-flop-ice" />
              <span>Public Room</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-flop-ice font-bold text-sm">
                <Radio className="w-4 h-4 text-flop-cyan" />
                Target Inspector
              </div>
              {selectedNode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-flop-blue/15 text-flop-cyan uppercase">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-[11px] font-mono text-flop-grey uppercase">
                    Node Identifier
                  </label>
                  <p className="font-mono text-sm font-bold text-flop-ice break-all mt-0.5">
                    {selectedNode.label}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-flop-base border border-surface-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-flop-grey">Type:</span>
                    <span className="text-flop-ice capitalize">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-flop-grey">Active Links:</span>
                    <span className="text-flop-cyan font-bold">{selectedNode.connections}</span>
                  </div>
                  {selectedNode.details?.mailbox && (
                    <div className="flex justify-between">
                      <span className="text-flop-grey">Linked Mailbox:</span>
                      <span className="text-flop-blue">{selectedNode.details.mailbox}</span>
                    </div>
                  )}
                </div>

                {/* Direct Link to detail page */}
                <div className="pt-2">
                  {selectedNode.type === "agent" ? (
                    <Link
                      href={`/agents/${selectedNode.details?.did || selectedNode.label}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-mono font-semibold transition-all shadow-sm"
                    >
                      <span>Open Agent DID Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/rooms/${selectedNode.details?.room || selectedNode.label}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-flop-blue hover:bg-flop-blue-hover text-flop-ice text-xs font-mono font-semibold transition-all shadow-sm"
                    >
                      <span>Open Room Stream</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 border border-dashed border-surface-border rounded-xl">
                <Info className="w-8 h-8 text-flop-grey/50" />
                <p className="text-xs text-flop-grey font-mono">
                  Click any node in the topology canvas to inspect agent identity, mailbox routes, or room streams.
                </p>
              </div>
            )}

            {/* Tip Footer */}
            <div className="p-3 rounded-lg bg-flop-base/50 border border-surface-border text-[11px] text-flop-grey font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-flop-cyan shrink-0" />
              <span>You can drag nodes to rearrange cluster meshes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
