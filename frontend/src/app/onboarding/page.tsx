"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ProfileCompletionCard from "@/components/profile/ProfileCompletionCard";
import PhotoUploadButton from "@/components/profile/PhotoUploadButton";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { AVATAR_PALETTE, BANNER_PALETTE } from "@/lib/mock-data";
import { computeLiveProfileCompletion } from "@/lib/profileCompletion";

const STEPS = ["look", "about"] as const;

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<(typeof STEPS)[number]>("look");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_PALETTE[0]);
  const [banner, setBanner] = useState(user?.banner || BANNER_PALETTE[0]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [profileCompletePoints, setProfileCompletePoints] = useState(100); // fallback until fetched

  useEffect(() => {
    api
      .getRewards()
      .then(({ pointValues }) => setProfileCompletePoints(pointValues.profile_complete))
      .catch(() => {});
  }, []);

  // Revoke preview blob URLs whenever they're replaced or the page unmounts.
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

  const liveCompletion = useMemo(
    () =>
      computeLiveProfileCompletion({
        bio,
        location,
        website,
        hasAvatarPhoto: Boolean(avatarFile || user?.avatarUrl),
        hasBannerPhoto: Boolean(bannerFile || user?.bannerUrl),
      }),
    [bio, location, website, avatarFile, bannerFile, user?.avatarUrl, user?.bannerUrl]
  );

  if (!user) return null;

  async function finish(skipRest: boolean) {
    setSaving(true);
    setError("");
    try {
      const { user: updated, reward } = await api.updateMe(
        skipRest
          ? { profileComplete: true }
          : {
              avatarColor,
              banner,
              bio,
              location,
              website,
              profileComplete: true,
              avatarFile,
              bannerFile,
            }
      );
      updateUser(updated);
      if (reward?.awarded) {
        // Give the "you earned points" moment a beat on screen before
        // leaving onboarding, instead of it flashing by unnoticed.
        setEarnedPoints(reward.points);
        await new Promise((resolve) => setTimeout(resolve, 1400));
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  if (earnedPoints !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-4 text-center">
        <Sparkles className="h-10 w-10 text-accent" />
        <p className="text-2xl font-extrabold">Profile complete!</p>
        <p className="text-text-secondary">You earned {earnedPoints} points.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[13px] font-bold text-text-secondary">
            Step {STEPS.indexOf(step) + 1} of {STEPS.length}
          </p>
          <button
            onClick={() => finish(true)}
            disabled={saving}
            className="text-[13px] font-bold text-accent hover:underline disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-danger-hover px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}

        {step === "look" ? (
          <>
            <h1 className="mb-2 text-2xl font-extrabold">Pick your look</h1>
            <p className="mb-6 text-text-secondary">
              Upload a photo or pick a color. You can always change this later.
            </p>

            <div className="mb-6 overflow-hidden rounded-2xl border border-border">
              <div
                className="relative h-24 w-full bg-cover bg-center"
                style={bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : { background: banner }}
              >
                <PhotoUploadButton
                  label="Upload banner image"
                  onSelect={selectBannerFile}
                  onError={setError}
                  className="absolute right-2 top-2 h-9 w-9"
                />
              </div>
              <div className="relative w-fit px-4 pb-4">
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
                  className="absolute bottom-2 right-2 h-8 w-8"
                />
              </div>
            </div>

            <p className="mb-2 text-[13px] font-bold text-text-secondary">Banner color</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {BANNER_PALETTE.map((g) => (
                <button
                  key={g}
                  onClick={() => setBanner(g)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    banner === g ? "border-accent" : "border-transparent"
                  }`}
                  style={{ background: g }}
                  aria-label="Choose banner"
                />
              ))}
            </div>

            <p className="mb-2 text-[13px] font-bold text-text-secondary">Avatar color</p>
            <div className="mb-8 flex flex-wrap gap-2">
              {AVATAR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    avatarColor === c ? "border-accent" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label="Choose avatar color"
                />
              ))}
            </div>

            <button
              onClick={() => setStep("about")}
              className="w-full rounded-full bg-text py-2.5 text-[15px] font-bold text-bg transition-opacity hover:opacity-90"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-extrabold">Tell us about yourself</h1>
            <p className="mb-4 text-text-secondary">
              This helps people find and recognize you. All optional.
            </p>

            <div className="mb-6">
              <ProfileCompletionCard completion={liveCompletion} rewardPoints={profileCompletePoints} />
            </div>

            <div className="mb-8 flex flex-col gap-4">
              <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
                <span className="text-[13px] text-text-secondary">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="resize-none bg-transparent text-[15px] outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
                <span className="text-[13px] text-text-secondary">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={30}
                  className="bg-transparent text-[15px] outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 focus-within:border-accent">
                <span className="text-[13px] text-text-secondary">Website</span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={100}
                  className="bg-transparent text-[15px] outline-none"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("look")}
                className="flex-1 rounded-full border border-border py-2.5 text-[15px] font-bold transition-colors hover:bg-hover"
              >
                Back
              </button>
              <button
                onClick={() => finish(false)}
                disabled={saving}
                className="flex-1 rounded-full bg-text py-2.5 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Finishing…" : "Finish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
