"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AVATAR_PALETTE, BANNER_PALETTE } from "@/lib/mock-data";
import type { User } from "@/lib/types";

export default function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (user: User) => void;
}) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [website, setWebsite] = useState(user.website);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [banner, setBanner] = useState(user.banner);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api.updateMe({
        name: name.trim(),
        bio,
        location,
        website,
        avatarColor,
        banner,
      });
      updateUser(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center bg-modal-overlay pt-0 sm:items-center sm:pt-8"
      onClick={onClose}
    >
      <div
        className="animate-modal-in flex max-h-full w-full max-w-[600px] flex-col overflow-y-auto bg-bg sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-xl font-extrabold">Edit profile</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-text px-4 py-1.5 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="h-32 w-full" style={{ background: banner }} />
        <div className="px-4">
          <Avatar user={{ ...user, avatarColor }} size="xl" className="-mt-11" />
        </div>

        <div className="flex flex-col gap-4 p-4">
          {error && <p className="text-[13px] text-danger">{error}</p>}

          <div>
            <p className="mb-2 text-[13px] font-bold text-text-secondary">Banner color</p>
            <div className="flex flex-wrap gap-2">
              {BANNER_PALETTE.map((g) => (
                <button
                  key={g}
                  onClick={() => setBanner(g)}
                  className={`h-9 w-9 rounded-full border-2 ${
                    banner === g ? "border-accent" : "border-transparent"
                  }`}
                  style={{ background: g }}
                  aria-label="Choose banner"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-text-secondary">Avatar color</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className={`h-9 w-9 rounded-full border-2 ${
                    avatarColor === c ? "border-accent" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label="Choose avatar color"
                />
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 border-b border-border pb-2">
            <span className="text-[13px] text-text-secondary">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="bg-transparent text-[17px] outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 border-b border-border pb-2">
            <span className="text-[13px] text-text-secondary">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="resize-none bg-transparent text-[17px] outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 border-b border-border pb-2">
            <span className="text-[13px] text-text-secondary">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={30}
              className="bg-transparent text-[17px] outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 border-b border-border pb-2">
            <span className="text-[13px] text-text-secondary">Website</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              maxLength={100}
              className="bg-transparent text-[17px] outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
