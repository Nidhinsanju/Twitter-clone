"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatTimeAgo } from "@/lib/format";
import type { ChatMessage, Conversation, User } from "@/lib/types";

export default function MessagesPage() {
  const { user: me } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  function loadConversations() {
    return api
      .getConversations()
      .then(({ conversations }) => setConversations(conversations))
      .catch(() => setConversations([]));
  }

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, []);

  function openSuggestions() {
    setShowSuggestions(true);
    api
      .listUsers(8)
      .then(({ users }) => setSuggestions(users))
      .catch(() => setSuggestions([]));
  }

  async function openConversation(conversation: Conversation) {
    setShowSuggestions(false);
    setSelected(conversation);
    setMessages([]);
    try {
      const { messages } = await api.getMessages(conversation.id);
      setMessages(messages);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, unread: false } : c))
      );
    } catch {
      setMessages([]);
    }
  }

  async function startConversation(username: string) {
    try {
      const { conversation } = await api.startConversation(username);
      setConversations((prev) =>
        prev.some((c) => c.id === conversation.id) ? prev : [conversation, ...prev]
      );
      await openConversation(conversation);
    } catch {
      // ignore — user can retry
    }
  }

  async function sendMessage() {
    if (!selected || !draft.trim() || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    try {
      const { message } = await api.sendMessage(selected.id, text);
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, lastMessage: text, lastMessageAt: message.createdAt } : c
        )
      );
    } catch {
      setDraft(text); // restore on failure
    } finally {
      setSending(false);
    }
  }

  if (selected) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex items-center gap-4 border-b border-border px-4 py-2.5">
          <button
            onClick={() => setSelected(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar user={selected.user} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">{selected.user.name}</p>
            <p className="truncate text-[13px] text-text-secondary">@{selected.user.handle}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4 no-scrollbar">
          {messages.map((m) => {
            const fromMe = m.senderId === me?.id;
            return (
              <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] ${
                    fromMe
                      ? "rounded-br-md bg-accent text-white"
                      : "rounded-bl-md bg-bg-secondary text-text"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
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
            disabled={!draft.trim() || sending}
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
        <button
          onClick={openSuggestions}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
          aria-label="New message"
        >
          <Mail className="h-5 w-5" />
        </button>
      </div>

      {showSuggestions && (
        <div>
          <p className="border-b border-border px-4 py-2 text-[13px] font-bold text-text-secondary">
            Start a conversation
          </p>
          {suggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => startConversation(user.handle)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-hover/40"
            >
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{user.name}</p>
                <p className="truncate text-[15px] text-text-secondary">@{user.handle}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!showSuggestions && !loading && conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
          <p className="text-xl font-extrabold">No messages yet</p>
          <p className="text-text-secondary">Start a conversation with someone you follow.</p>
          <button
            onClick={openSuggestions}
            className="mt-2 rounded-full bg-accent px-4 py-1.5 text-[15px] font-bold text-white transition-colors hover:bg-accent-hover"
          >
            New message
          </button>
        </div>
      ) : (
        !showSuggestions &&
        conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => openConversation(c)}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-hover/40"
          >
            <Avatar user={c.user} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[15px]">
                <span className="truncate font-bold">{c.user.name}</span>
                <span className="shrink-0 truncate text-text-secondary">@{c.user.handle}</span>
                <span className="shrink-0 text-text-secondary">·</span>
                <span className="shrink-0 text-text-secondary" suppressHydrationWarning>
                  {formatTimeAgo(c.lastMessageAt)}
                </span>
              </div>
              <p className={`truncate text-[15px] ${c.unread ? "font-bold text-text" : "text-text-secondary"}`}>
                {c.lastMessage || "Say hello 👋"}
              </p>
            </div>
            {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
          </button>
        ))
      )}
    </div>
  );
}
