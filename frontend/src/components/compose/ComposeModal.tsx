"use client";

import { X } from "lucide-react";
import { useComposeModal } from "@/context/ComposeModalContext";
import ComposeForm from "./ComposeForm";

export default function ComposeModal() {
  const { isOpen, close } = useComposeModal();

  if (!isOpen) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center bg-modal-overlay pt-0 sm:items-center sm:pt-8"
      onClick={close}
    >
      <div
        className="animate-modal-in flex max-h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-none bg-bg sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2">
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ComposeForm autoFocus placeholder="What's happening?" onPosted={close} />
      </div>
    </div>
  );
}
