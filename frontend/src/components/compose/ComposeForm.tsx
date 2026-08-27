"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Image as ImageIcon, ListOrdered, MapPin, Smile, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import CharCountRing from "@/components/ui/CharCountRing";
import { useFeed } from "@/context/FeedContext";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const MAX = 280;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// The rest of the toolbar (lists, emoji, schedule, location) is presentational —
// only image attachment is actually wired up to the backend.
const DECORATIVE_TOOLBAR_ICONS = [ListOrdered, Smile, Calendar, MapPin];

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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTweet } = useFeed();
  const { user } = useAuth();

  // Revoke the blob URL whenever it's replaced or the form unmounts, so we
  // don't leak object URLs across a session of composing several posts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!user) return null;

  const canPost = (text.trim().length > 0 || image) && text.length <= MAX && !posting;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP or GIF images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
  }

  async function handleSubmit() {
    if (!canPost) return;
    setPosting(true);
    setError("");
    try {
      await addTweet(text.trim(), image);
      setText("");
      removeImage();
      onPosted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar user={user} size="md" />
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

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleImageSelect}
          className="hidden"
        />

        {imagePreview && (
          <div className="relative mt-3 w-full overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a next/image-optimizable URL */}
            <img src={imagePreview} alt="Selected upload" className="max-h-80 w-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && <p className="mb-2 mt-2 text-[13px] text-danger">{error}</p>}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="-ml-2 flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-hover-blue"
              aria-label="Add image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            {DECORATIVE_TOOLBAR_ICONS.map((Icon, i) => (
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
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
