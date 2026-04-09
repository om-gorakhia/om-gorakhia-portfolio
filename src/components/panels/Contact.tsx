"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { resume } from "@/data/resume";
import { projectSlugs } from "@/data/projects";

interface TerminalLine {
  type: "input" | "output" | "system" | "error";
  text: string;
}

const COMMANDS = [
  "help",
  "whois",
  "links",
  "projects",
  "open",
  "clear",
  "contact",
  "send",
  "skills",
  "hello",
] as const;

const OPEN_TARGETS = ["github", "linkedin", "email", ...projectSlugs];

function buildHelp(): string {
  return [
    "Available commands:",
    "",
    "  help       Show this help message",
    "  whois      Display profile summary",
    "  links      Show contact & social links",
    "  skills     List technical skills",
    "  projects   List portfolio projects",
    "  open <t>   Open a link (github | linkedin | email | <project>)",
    "  contact    Show contact information",
    "  send <msg> Open email with message",
    "  clear      Clear terminal",
    "  hello      Say hi",
  ].join("\n");
}

function buildWhois(): string {
  return [
    `Name:      ${resume.fullName}`,
    `Email:     ${resume.email}`,
    `Role:      ${resume.experience[0]?.title ?? "—"}`,
    `Company:   ${resume.experience[0]?.company ?? "—"}`,
    `Education: ${resume.education[0]?.degree}`,
    `           ${resume.education[0]?.institution}`,
    `Tagline:   "${resume.tagline}"`,
  ].join("\n");
}

function buildLinks(): string {
  return [
    `GitHub:   ${resume.github}`,
    `LinkedIn: ${resume.linkedin}`,
    `Email:    ${resume.email}`,
  ].join("\n");
}

function buildSkills(): string {
  return Object.entries(resume.skills)
    .map(([category, items]) => `  ${category}: ${(items as string[]).join(", ")}`)
    .join("\n");
}

function buildProjects(): string {
  return projectSlugs
    .map((slug, i) => `  ${i + 1}. ${slug}`)
    .join("\n");
}

export function Contact() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "om@portfolio:~$ contact --init" },
    { type: "output", text: 'Contact system online. Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Tab autocomplete
  const handleTabComplete = useCallback(() => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      // Complete command name
      const matches = COMMANDS.filter((c) => c.startsWith(parts[0]));
      if (matches.length === 1) {
        setInput(matches[0] + " ");
        setSuggestion("");
      }
    } else if (parts[0] === "open" && parts.length === 2) {
      // Complete open target
      const matches = OPEN_TARGETS.filter((t) => t.startsWith(parts[1]));
      if (matches.length === 1) {
        setInput(`open ${matches[0]}`);
        setSuggestion("");
      }
    }
  }, [input]);

  // Update ghost suggestion as user types
  useEffect(() => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) { setSuggestion(""); return; }

    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      const match = COMMANDS.find((c) => c.startsWith(parts[0]) && c !== parts[0]);
      setSuggestion(match ? match.slice(parts[0].length) : "");
    } else if (parts[0] === "open" && parts.length === 2) {
      const match = OPEN_TARGETS.find((t) => t.startsWith(parts[1]) && t !== parts[1]);
      setSuggestion(match ? match.slice(parts[1].length) : "");
    } else {
      setSuggestion("");
    }
  }, [input]);

  const pushLines = useCallback((...newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const raw = input.trim();
      const parts = raw.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(" ");

      // Push input line
      const inputLine: TerminalLine = { type: "input", text: `om@portfolio:~$ ${raw}` };

      // Add to history
      setHistory((prev) => [...prev.filter((h) => h !== raw), raw]);
      setHistoryIdx(-1);
      setInput("");
      setSuggestion("");

      const out: TerminalLine[] = [inputLine];

      switch (cmd) {
        case "help":
          out.push({ type: "output", text: buildHelp() });
          break;

        case "whois":
          out.push({ type: "output", text: buildWhois() });
          break;

        case "links":
          out.push({ type: "output", text: buildLinks() });
          break;

        case "skills":
          out.push({ type: "output", text: buildSkills() });
          break;

        case "projects":
          out.push({ type: "output", text: buildProjects() });
          break;

        case "open": {
          if (!arg) {
            out.push({ type: "error", text: 'Usage: open <github|linkedin|email|project-slug>' });
            break;
          }
          const target = arg.toLowerCase();
          if (target === "github") {
            out.push({ type: "system", text: `Opening ${resume.github}...` });
            window.open(resume.github, "_blank");
          } else if (target === "linkedin") {
            out.push({ type: "system", text: `Opening ${resume.linkedin}...` });
            window.open(resume.linkedin, "_blank");
          } else if (target === "email") {
            out.push({ type: "system", text: `Opening mailto:${resume.email}...` });
            window.open(`mailto:${resume.email}`, "_blank");
          } else if (projectSlugs.includes(target)) {
            out.push({ type: "system", text: `Navigating to /work/${target}...` });
            window.location.href = `/work/${target}`;
          } else {
            out.push({ type: "error", text: `Unknown target: "${arg}". Try: github, linkedin, email, or a project slug.` });
          }
          break;
        }

        case "contact":
          out.push({
            type: "output",
            text: [
              `Email:    ${resume.email}`,
              `GitHub:   ${resume.github}`,
              `LinkedIn: ${resume.linkedin}`,
              "",
              'Use "send <message>" to draft an email, or "open email" to open mail client.',
            ].join("\n"),
          });
          break;

        case "send": {
          if (!arg) {
            out.push({ type: "error", text: 'Usage: send <your message>' });
            break;
          }
          out.push({ type: "system", text: "Opening email client with your message..." });
          const subject = encodeURIComponent("Hey Om — from your portfolio");
          const body = encodeURIComponent(arg);
          window.open(`mailto:${resume.email}?subject=${subject}&body=${body}`, "_blank");
          break;
        }

        case "clear":
          setLines([{ type: "system", text: "om@portfolio:~$ Terminal cleared." }]);
          return;

        case "hello":
        case "hi":
        case "hey":
          out.push({
            type: "output",
            text: `Hey! I'm Om. Thanks for stopping by. Use "contact" to see how to reach me, or "send <msg>" to fire off a quick email.`,
          });
          break;

        default:
          out.push({
            type: "error",
            text: `command not found: ${cmd}. Type "help" for available commands.`,
          });
      }

      pushLines(...out);
    },
    [input, pushLines]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        handleTabComplete();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx === -1) return;
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    },
    [handleTabComplete, history, historyIdx]
  );

  return (
    <section id="contact" className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <MonoLabel className="mb-3 block">ssh om@contact</MonoLabel>
          <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4">
            Get in Touch
          </h2>
        </motion.div>

        {/* Contact chips */}
        <motion.div
          className="flex gap-3 mb-6 flex-wrap"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a
            href={resume.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface hover:border-accent/30 hover:text-accent-light transition-colors"
          >
            github
          </a>
          <a
            href={resume.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface hover:border-accent/30 hover:text-accent-light transition-colors"
          >
            linkedin
          </a>
          <a
            href={`mailto:${resume.email}`}
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface hover:border-accent/30 hover:text-accent-light transition-colors"
          >
            {resume.email}
          </a>
        </motion.div>

        {/* Terminal */}
        <motion.div
          className="rounded-2xl border border-surface-border bg-[#0a0b0f] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border bg-surface/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="font-mono text-[10px] text-foreground/60 ml-2">
              om@portfolio — contact
            </span>
            <span className="font-mono text-[10px] text-foreground/60 ml-auto">
              {COMMANDS.length} commands available
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="p-4 h-72 overflow-y-auto font-mono text-sm leading-relaxed"
            onClick={() => inputRef.current?.focus()}
          >
            <AnimatePresence>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`whitespace-pre-wrap mb-1 ${
                    line.type === "input"
                      ? "text-accent-light"
                      : line.type === "system"
                        ? "text-accent-light/80"
                        : line.type === "error"
                          ? "text-red-400"
                          : "text-foreground/60"
                  }`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2 relative">
              <span className="text-accent-light/85 shrink-0">om@portfolio:~$</span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none text-foreground caret-accent-light relative z-10"
                  placeholder="Type a command..."
                  autoComplete="off"
                  spellCheck={false}
                />
                {/* Ghost suggestion */}
                {suggestion && (
                  <span className="absolute left-0 top-0 pointer-events-none text-foreground/20 z-0">
                    {input}{suggestion}
                  </span>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Hint strip */}
        <motion.div
          className="mt-3 flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {["Tab: autocomplete", "↑↓: history", "help: commands"].map((hint) => (
            <span key={hint} className="font-mono text-[10px] text-foreground/60">
              {hint}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
