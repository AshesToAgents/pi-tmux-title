# pi-tmux-title

A [pi](https://github.com/mariozechner/pi-coding-agent) extension that dynamically sets tmux window titles to reflect what the agent is doing.

## Install

```bash
# Global (user-level)
pi install git:github.com/AshesToAgents/pi-tmux-title

# Project-level (shared with team via .pi/settings.json)
pi install -l git:github.com/AshesToAgents/pi-tmux-title

# Try without installing
pi -e git:github.com/AshesToAgents/pi-tmux-title
```

## What's Included

| Type | Name | Description |
|------|------|-------------|
| Extension | tmux-title | Sets tmux window title based on agent activity state |

## Usage

The extension activates automatically when pi is running inside a tmux session. No configuration needed.

**Title states:**

| Title | When |
|-------|------|
| `pi · ready` | Idle, waiting for input |
| `pi · thinking…` | Agent is processing |
| `pi · bash` | Running a bash command |
| `pi · edit` | Editing a file |
| `pi · read` | Reading a file |
| _(restores automatic-rename)_ | Session shut down |

The tool name in the title updates in real time as the agent executes each tool call, so you can see at a glance what pi is doing across multiple tmux windows or panes.

## Requirements

- Must be running inside a tmux session (detected via `$TMUX` environment variable)
- The extension is a no-op outside tmux

## Development

```bash
npm install
npm run typecheck
```

## License

MIT
