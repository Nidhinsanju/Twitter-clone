"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/imageUpload";

// A round camera-icon button that opens a file picker and hands back a
// validated File. Used to overlay the avatar circle and banner strip in
// onboarding and Edit Profile — the caller owns the preview/state.
export default function PhotoUploadButton({
  onSelect,
  onError,
  label,
  className = "",
}: {
  onSelect: (file: File) => void;
  onError: (message: string) => void;
  label: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }
    onSelect(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={label}
        title={label}
        className={`flex items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75 ${className}`}
      >
        <Camera className="h-5 w-5" />
      </button>
    </>
  );
}
