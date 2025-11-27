process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED PROMISE REJECTION:');
    console.error('Reason:', reason); // This will print the real error object or string
    console.error('At:', promise);
    process.exit(1); // Exit with failure
});
process.on('uncaughtException', (err, origin) => {
    console.error('💥 UNCAUGHT EXCEPTION:');
    console.error('Error:', err); // This will print the real error
    console.error('Origin:', origin);
    process.exit(1); // Exit with failure
});
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const BACKEND_URL = process.env.PETPAWTRAIT_BACKEND_URL || "http://localhost:8080";
// Simple in-memory log buffer – you can improve this later
let recentLogs = [];
function addLog(line) {
    recentLogs.push(line);
    if (recentLogs.length > 500) {
        recentLogs = recentLogs.slice(-500);
    }
}
const getRecentErrorsTool = {
    name: "getRecentErrors",
    description: "Return recent logs/errors from the petpawtrait backend",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Max lines to return",
                default: 100,
            },
        },
    },
    async *call(request, _context) {
        const parsed = CallToolRequestSchema.parse(request);
        const limit = Math.max(1, Math.min(500, parsed.params.input?.limit ?? 100));
        const lines = recentLogs.slice(-limit);
        return {
            content: [
                {
                    type: "text",
                    text: lines.join("\n"),
                },
            ],
        };
    },
};
const pingBackendTool = {
    name: "pingBackend",
    description: "Check if the petpawtrait backend is reachable and /health or /api status",
    inputSchema: {
        type: "object",
        properties: {
            path: {
                type: "string",
                description: "Path to check, e.g. /health or /api/generate",
                default: "/health",
            },
        },
    },
    async *call(request, _context) {
        const parsed = CallToolRequestSchema.parse(request);
        const path = parsed.params.input?.path || "/health";
        const url = BACKEND_URL.replace(/\/+$/, "") + path;
        try {
            const res = await fetch(url, { method: "GET" });
            const text = await res.text();
            return {
                content: [
                    {
                        type: "text",
                        text: `URL: ${url}\nStatus: ${res.status}\nBody:\n${text}`,
                    },
                ],
            };
        }
        catch (err) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error reaching ${url}: ${err?.message ?? String(err)}`,
                    },
                ],
            };
        }
    },
};
async function main() {
    const server = new Server({
        name: "petpawtrait-mcp",
        version: "0.0.1",
    }, {
        tools: [getRecentErrorsTool, pingBackendTool],
    });
    // If you want to ingest logs, you can later add something like:
    // - watch a log file
    // - run a child process of your backend and stream stdout into addLog()
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Temporary: manual test log so there's *something* to read
    addLog("[startup] petpawtrait MCP server initialised.");
}
main().catch((err) => {
    console.error("MCP server failed:", err);
    process.exit(1);
});
