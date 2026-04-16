import { useState, useRef, useEffect } from "react";

const HOST = "NotebAdmin";

// ── COMMANDS ──────────────────────────────────────────────

export default function NotebTerminal({ token, isAdmin, adminName }) {
  const banUser = () => {
    console.log("1");
  };

  const COMMANDS = {
    help: {
      description: "List available commands",
      run: () => [
        "Available commands:",
        "  help         — show this list",
        "  clear / cls  — clear terminal",
        "  whoami       — show current user",
        "  status       — placeholder: check system status",
        "",
        "Add your own commands inside the COMMANDS object.",
      ],
    },

    whoami: {
      description: "Show current user",
      run: () => [`${adminName}@${HOST}`],
    },

    clear: { description: "Clear terminal", run: () => "__CLEAR__" },
    cls: { description: "Clear terminal", run: () => "__CLEAR__" },

    ban: {
      description: "Ban user: ban -u -i [id]",
      run: (args) => {
        const userIndex = args.indexOf("-u");
        const userName = if (userIndex !== -1); else args[userIndex + 1] 
        const idIndex = args.indexOf("-i");
        const userId = idIndex !== -1 ? args[idIndex + 1] : "N/A";

        console.log(`Banning ID: ${userId}`);
        banUser();

        return [`Target ID: ${userId}`, "Status: 1"];
      },
    },

    status: {
      description: "Check system status (placeholder)",
      run: (args) => {
        // TODO: replace with real logic
        return [
          "● system   : running",
          "● services : 4 / 4 active",
          "● uptime   : 99.9%",
          args.length ? `  (args: ${args.join(", ")})` : null,
        ].filter(Boolean);
      },
    },
    // ─────────────────────────────────────────────────────────
  };

  const [history, setHistory] = useState([
    { type: "sys", text: `NotebAdmin Terminal — type 'help' to begin` },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [history]);

  const pushLines = (lines, type = "out") =>
    lines.map((text) => ({ type, text }));

  const execute = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistIdx(-1);

    const echo = {
      type: "cmd",
      text: `${adminName}@${HOST}~§ ${trimmed}`,
    };
    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = COMMANDS[cmd.toLowerCase()];

    if (!handler) {
      setHistory((prev) => [
        ...prev,
        echo,
        { type: "err", text: `command not found: ${cmd}` },
      ]);
      return;
    }

    const result = handler.run(args);

    if (result === "__CLEAR__") {
      setHistory([]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      echo,
      ...pushLines(Array.isArray(result) ? result : [result]),
    ]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = Math.min(i + 1, cmdHistory.length - 1);
        setInput(cmdHistory[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = Math.max(i - 1, -1);
        setInput(next === -1 ? "" : cmdHistory[next]);
        return next;
      });
    }
  };

  const lineColor = {
    cmd: "#c8c8c8",
    out: "#7a9e7e",
    err: "#b55555",
    sys: "#666666",
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: "#0d0d0d",
        color: "#c8c8c8",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "#161616",
          borderBottom: "1px solid #2a2a2a",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "#555",
            letterSpacing: "0.05em",
          }}
        >
          admin — NotebAdmin
        </span>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px 6px",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {history.map((line, i) => (
          <div
            key={i}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: lineColor[line.type] ?? "#c8c8c8",
              fontStyle: line.type === "sys" ? "italic" : "normal",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Prompt row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 16px 12px",
          borderTop: "1px solid #1e1e1e",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            whiteSpace: "nowrap",
            userSelect: "none",
            marginRight: 6,
          }}
        >
          <span style={{ color: "#5fafdf", fontWeight: "bold" }}>
            {adminName}
          </span>
          <span style={{ color: "#888" }}>@</span>
          <span style={{ color: "#87ceab", fontWeight: "bold" }}>{HOST}</span>
          <span style={{ color: "#aaa" }}>~</span>
          <span style={{ color: "#e0a060" }}>§</span>
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#c8c8c8",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            caretColor: "#5fafdf",
          }}
        />
      </div>
    </div>
  );
}
