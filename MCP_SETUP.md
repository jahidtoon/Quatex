# MCP setup and troubleshooting

This workspace includes optional MCP (Model Context Protocol) settings under `.vscode/mcp.json`.

- Default: MCP servers are disabled to avoid initialize timeouts and async notification connection errors when no server is running.
- Enable locally: uncomment the `quatex` server section and point it to a running MCP server, e.g. `http://localhost:3000`.
- Do not point MCP at your Next.js app unless it implements MCP endpoints; otherwise the client will retry and log initialize/connect errors.

How to verify
1. Reload VS Code window after changes.
2. Open the Output panel and select the MCP client/channel.
   - If disabled: there should be no repeated "Waiting for server to respond to initialize" logs.
   - If enabled with a running server: you should see a single initialize success and no retry errors.

Tips
- Keep `.vscode/mcp.json` checked in with disabled servers; enable locally as needed.
- For remote MCP endpoints, ensure they are reachable and CORS/allowed origins are configured as necessary.

## Windows install error: anthropic/jiter via uv (WinError 2)

If you see an error like the following when enabling/starting an MCP server that depends on `anthropic` (transitively pulls `jiter`):

```
FileNotFoundError: [WinError 2] The system cannot find the file specified
help: `jiter` (v0.11.0) was included because `serena-agent` (v0.1.4) depends on `anthropic` (v0.69.0) which depends on `jiter`
```

Cause
- Python 3.14 on Windows currently has no prebuilt wheel for `jiter`, so the installer tries to build it from source. That build needs the Rust toolchain (`cargo`/`rustc`) and MSVC/C++ Build Tools. If those aren’t present, you’ll get WinError 2 during the subprocess spawn.

Fix options (pick one)
- Recommended: use Python 3.11 or 3.12 for the MCP server environment so a prebuilt `jiter` wheel is used.
   - Create a virtualenv with Python 3.12, then install your MCP server (e.g., `serena-agent`).
- Or install the native toolchain so the build from source can succeed:
   - Install Rust via rustup (MSVC toolchain) and Visual Studio Build Tools (C++ workload).

Verification
- After switching to Python 3.12/3.11 or installing Rust + Build Tools, reinstall the MCP server deps and re-run. The error should disappear.

Notes
- This is an environment/build issue on Windows, not a workspace bug. On Linux/macOS, prebuilt wheels usually avoid this.
