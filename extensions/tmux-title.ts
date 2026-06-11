/**
 * Tmux Window Title Extension
 *
 * Dynamically sets the tmux window name to reflect pi's current state.
 * Only activates when running inside a tmux session (detects TMUX env var).
 *
 * Uses `tmux rename-window` to update the window name directly, so it works
 * with any tmux status bar theme that displays `#W`.
 *
 * States:
 *   pi · ready          — idle, waiting for input
 *   pi · thinking…      — agent is processing
 *   pi · [tool-name]    — executing a specific tool (bash, edit, etc.)
 */

import { execSync } from "node:child_process";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const PREFIX = "pi · ";

function isTmux(): boolean {
	return !!process.env.TMUX;
}

function renameWindow(name: string) {
	try {
		execSync(`tmux rename-window -- "${name}"`, { stdio: "pipe" });
	} catch {
		// Not in tmux or tmux not available — ignore
	}
}

export default function (pi: ExtensionAPI) {
	if (!isTmux()) return;

	function setTitle(suffix: string) {
		renameWindow(`${PREFIX}${suffix}`);
	}

	pi.on("session_start", async () => {
		setTitle("ready");
	});

	pi.on("agent_start", async () => {
		setTitle("thinking…");
	});

	pi.on("tool_execution_start", async (event) => {
		setTitle(event.toolName);
	});

	pi.on("tool_execution_end", async () => {
		setTitle("thinking…");
	});

	pi.on("agent_end", async () => {
		setTitle("ready");
	});

	pi.on("session_shutdown", async () => {
		try {
			execSync("tmux set-window-option automatic-rename on", { stdio: "pipe" });
		} catch {
			// ignore
		}
	});
}
