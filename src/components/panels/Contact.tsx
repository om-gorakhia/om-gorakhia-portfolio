"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { resume } from "@/data/resume";

interface TerminalLine {
  type: "input" | "output" | "system";
  text: string;
}

export function Contact() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "om@portfolio:~$ contact --init" },
    { type: "output", text: "Contact system online. Type your message and press Enter." },
    { type: "output", text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLines: TerminalLine[] = [
      { type: "input", text: `om@portfolio:~$ ${input}` },
    ];

    const cmd = input.trim().toLowerCase();

    if (cmd === "help") {
      newLines.push({
        type: "output",
        text: `Available commands:
  email    → Open email client
  github   → Open GitHub profile
  linkedin → Open LinkedIn profile
  clear    → Clear terminal
  hello    → Say hi`,
      });
    } else if (cmd === "email") {
      newLines.push({ type: "system", text: `Opening mailto:${resume.email}...` });
      window.open(`mailto:${resume.email}`, "_blank");
    } else if (cmd === "github") {
      newLines.push({ type: "system", text: `Navigating to ${resume.github}...` });
      window.open(resume.github, "_blank");
    } else if (cmd === "linkedin") {
      newLines.push({ type: "system", text: `Navigating to ${resume.linkedin}...` });
      window.open(resume.linkedin, "_blank");
    } else if (cmd === "clear") {
      setLines([{ type: "system", text: "om@portfolio:~$ Terminal cleared." }]);
      setInput("");
      return;
    } else if (cmd === "hello" || cmd === "hi" || cmd === "hey") {
      newLines.push({
        type: "output",
        text: `Hey! 👋 I'm Om. Thanks for visiting. Send me a message at ${resume.email} — I'd love to chat.`,
      });
    } else {
      // Treat everything else as a message → mailto
      newLines.push({
        type: "system",
        text: "Message received. Opening email client with your message...",
      });
      const subject = encodeURIComponent("Hey Om — from your portfolio");
      const body = encodeURIComponent(input);
      window.open(`mailto:${resume.email}?subject=${subject}&body=${body}`, "_blank");
    }

    setLines((prev) => [...prev, ...newLines]);
    setInput("");
  };

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
            <span className="font-mono text-[10px] text-foreground/50 ml-2">
              om@portfolio — contact
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="p-4 h-64 overflow-y-auto font-mono text-sm leading-relaxed"
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
                        : "text-foreground/60"
                  }`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <span className="text-accent-light/70 shrink-0">om@portfolio:~$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground caret-accent-light"
                placeholder="Type a message or command..."
              />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
