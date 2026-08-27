"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Send, Settings } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { conversations, getUser } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/format";
import type { Conversation } from "@/lib/types";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [convos, setConvos] = useState<Conversation[]>(conversations);
  const [draft, setDraft] = useState("");

  const selected = convos.find((c) => c.id === selectedId) ?? null;

  function sendMessage() {
    if (!selected || !draft.trim()) return;
    setConvos((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              lastMessage: draft.trim(),
              messages: [
                ...c.messages,
                {
                  id: `m-${Date.now()}`,
                  fromMe: true,
                  text: draft.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );
    setDraft("");
  }

  if (selected) {
    const user = getUser(selected.userId);
    return (
      <div className="flex h-screen flex-col">
        <div className="flex items-center gap-4 border-b border-border px-4 py-2.5">
          <button
            onClick={() => setSelectedId(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar user={user} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">{user.name}</p>
            <p className="truncate text-[13px] text-text-secondary">@{user.handle}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4 no-scrollbar">
          {selected.messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] ${
                  m.fromMe
                    ? "rounded-br-md bg-accent text-white"
                    : "rounded-bl-md bg-bg-secondary text-text"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Start a new message"
            className="flex-1 rounded-full bg-bg-secondary px-4 py-2.5 text-[15px] outline-none placeholder:text-text-secondary"
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-hover-blue disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-extrabold">Messages</h1>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover">
            <Settings className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover">
            <Mail className="h-5 w-5" />
          </button>
        </div>
      </div>

      {convos.map((c) => {
        const user = getUser(c.userId);
        return (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-hover/40"
          >
            <Avatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[15px]">
                <span className="truncate font-bold">{user.name}</span>
                <span className="shrink-0 truncate text-text-secondary">
                  @{user.handle}
                </span>
                <span className="shrink-0 text-text-secondary">·</span>
                <span className="shrink-0 text-text-secondary">
                  {formatTimeAgo(c.createdAt)}
                </span>
              </div>
              <p
                className={`truncate text-[15px] ${
                  c.unread ? "font-bold text-text" : "text-text-secondary"
                }`}
              >
                {c.lastMessage}
              </p>
            </div>
            {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}
