"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import PhotoUploadButton from "@/components/profile/PhotoUploadButton";
import { api, ApiError, API_URL } from "@/lib/api";
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);

  // Revoke preview blob URLs whenever they're replaced or the modal unmounts.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  function selectAvatarFile(file: File) {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }
  function selectBannerFile(file: File) {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { user: updated, reward } = await api.updateMe({
        name: name.trim(),
        bio,
        location,
        website,
        avatarColor,
        banner,
        avatarFile,
        bannerFile,
      });
      updateUser(updated);
      onSaved(updated);
      if (reward?.awarded) {
        // Let the "you earned points" moment show briefly instead of the
        // modal just vanishing along with the news.
        setEarnedPoints(reward.points);
        setTimeout(onClose, 1400);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  if (earnedPoints !== null) {
    return (
      <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-modal-overlay">
        <div className="animate-modal-in flex flex-col items-center gap-2 rounded-2xl bg-bg px-8 py-10 text-center">
          <Sparkles className="h-10 w-10 text-accent" />
          <p className="text-xl font-extrabold">Profile complete!</p>
          <p className="text-text-secondary">You earned {earnedPoints} points.</p>
        </div>
      </div>
    );
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

        <div
          className="relative h-32 w-full bg-cover bg-center"
          style={
            bannerPreview
              ? { backgroundImage: `url(${bannerPreview})` }
              : user.bannerUrl && !bannerFile
                ? { backgroundImage: `url(${API_URL}${user.bannerUrl})` }
                : { background: banner }
          }
        >
          <PhotoUploadButton
            label="Upload banner image"
            onSelect={selectBannerFile}
            onError={setError}
            className="absolute right-3 top-3 h-9 w-9"
          />
        </div>
        <div className="relative w-fit px-4">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a next/image-optimizable URL
            <img
              src={avatarPreview}
              alt=""
              className="-mt-11 h-[88px] w-[88px] rounded-full border-4 border-bg object-cover"
            />
          ) : (
            <Avatar user={{ ...user, avatarColor }} size="xl" className="-mt-11" />
          )}
          <PhotoUploadButton
            label="Upload profile picture"
            onSelect={selectAvatarFile}
            onError={setError}
            className="absolute bottom-1 right-1 h-8 w-8"
          />
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
