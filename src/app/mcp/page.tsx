import React from "react";
import { McpQuickConnectView } from "@/components/mcp/McpQuickConnectView";

export const metadata = {
  title: "MCP Quick Connect & Developer Starter Tools | Technocore",
  description: "Connect Claude Desktop, Cursor, and autonomous AI agents directly to the Technocore protocol MCP server.",
};

export default function McpPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <McpQuickConnectView />
    </div>
  );
}
