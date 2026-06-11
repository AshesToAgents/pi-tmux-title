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

// Capture the window ID at load time so we always target the correct window,
// even if the user switches to a different tmux window while pi is working.
function getWindowId(): string | null {
	try {
		return execSync("tmux display-message -p '#{window_id}'", { stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
	} catch {
		return null;
	}
}

export default function (pi: ExtensionAPI) {
	if (!isTmux()) return;

	const windowId = getWindowId();
	if (!windowId) return;

	function setTitle(suffix: string) {
		try {
			execSync(`tmux rename-window -t "${windowId}" -- "${PREFIX}${suffix}"`, { stdio: "pipe" });
		} catch {
			// ignore
		}
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
			execSync(`tmux set-window-option -t "${windowId}" automatic-rename on`, { stdio: "pipe" });
		} catch {
			// ignore
		}
	});
}
