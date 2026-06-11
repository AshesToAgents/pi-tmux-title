/**
 * Tmux Window Title Extension
 *
 * Dynamically sets the tmux window title to reflect pi's current state.
 * Only activates when running inside a tmux session (detects TMUX env var).
 *
 * States:
 *   pi · ready          — idle, waiting for input
 *   pi · thinking…      — agent is processing
 *   pi · [tool-name]    — executing a specific tool (bash, edit, etc.)
 *
 * Falls back to a plain "pi" title on shutdown.
 */

import path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const PREFIX = "pi · ";

function isTmux(): boolean {
	return !!process.env.TMUX;
}

function getProjectName(): string {
	return path.basename(process.cwd());
}

export default function (pi: ExtensionAPI) {
	if (!isTmux()) return;

	function setTitle(ctx: ExtensionContext, suffix: string) {
		ctx.ui.setTitle(`${PREFIX}${suffix}`);
	}

	pi.on("session_start", async (_event, ctx) => {
		setTitle(ctx, "ready");
	});

	pi.on("agent_start", async (_event, ctx) => {
		setTitle(ctx, "thinking…");
	});

	pi.on("tool_execution_start", async (event, ctx) => {
		setTitle(ctx, event.toolName);
	});

	pi.on("tool_execution_end", async (_event, ctx) => {
		setTitle(ctx, "thinking…");
	});

	pi.on("agent_end", async (_event, ctx) => {
		setTitle(ctx, "ready");
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		ctx.ui.setTitle("pi");
	});
}
