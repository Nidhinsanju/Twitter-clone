"use client";

import { useRef, useState } from "react";
import { Calendar, Image as ImageIcon, ListOrdered, MapPin, Smile } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import CharCountRing from "@/components/ui/CharCountRing";
import { getUser, CURRENT_USER_ID } from "@/lib/mock-data";
import { useFeed } from "@/context/FeedContext";

const MAX = 280;

const TOOLBAR_ICONS = [ImageIcon, ListOrdered, Smile, Calendar, MapPin];

export default function ComposeForm({
  autoFocus = false,
  placeholder = "What's happening?",
  onPosted,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  onPosted?: () => void;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addTweet } = useFeed();
  const me = getUser(CURRENT_USER_ID);

  const canPost = text.trim().length > 0 && text.length <= MAX;

  function handleSubmit() {
    if (!canPost) return;
    addTweet(text.trim());
    setText("");
    onPosted?.();
  }

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar user={me} size="md" />
      <div className="min-w-0 flex-1">
        <textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none overflow-hidden bg-transparent text-xl outline-none placeholder:text-text-secondary"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="-ml-2 flex items-center">
            {TOOLBAR_ICONS.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-hover-blue"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {text.length > 0 && (
              <>
                <CharCountRing length={text.length} />
                <div className="h-8 w-px bg-border" />
              </>
            )}
            <button
              type="button"
              disabled={!canPost}
              onClick={handleSubmit}
              className="rounded-full bg-accent px-4 py-1.5 text-[15px] font-bold text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
