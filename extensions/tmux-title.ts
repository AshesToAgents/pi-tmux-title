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

// Resolve targets by pane ID ($TMUX_PANE), which tmux sets in the environment of
// every process spawned inside a pane. This is the only reliable way to
// identify "our" window: untargeted commands and `display-message` without
// `-t` resolve against the *client's* focused window, so if pi is launched in
// a background window, a grouped session, or from a process whose tty doesn't
// match the attached client, tmux resolves a different (recently active)
// client's window and the title ends up on the wrong window. Tmux promotes a
// pane ID to its containing window for window-targeted commands, so the title
// also follows the pane across moves (join-pane, move-window).
function getPaneId(): string | null {
	const paneId = process.env.TMUX_PANE;
	return paneId && /^%\d+$/.test(paneId) ? paneId : null;
}

export default function (pi: ExtensionAPI) {
	if (!isTmux()) return;

	const paneId = getPaneId();
	if (!paneId) return;

	function setTitle(suffix: string) {
		try {
			execSync(`tmux rename-window -t "${paneId}" -- "${PREFIX}${suffix}"`, { stdio: "pipe" });
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
			execSync(`tmux set-window-option -t "${paneId}" automatic-rename on`, { stdio: "pipe" });
		} catch {
			// ignore
		}
	});
}
