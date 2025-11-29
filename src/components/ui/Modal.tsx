
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
  showCloseX?: boolean;
  ariaLabel?: string;
  footer?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
};

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
  showCloseX = true,
  ariaLabel,
  footer,
  initialFocusRef
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    const root = getPortalRoot();
    if (!root) return;
    if (isOpen) {
      lastFocused.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const el = initialFocusRef?.current || dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]");
        el?.focus();
      }, 0);
    } else {
      document.body.style.overflow = "";
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialFocusRef]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        // Basic focus trap
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, onClose]);

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!isOpen) return null;
  const root = getPortalRoot();
  if (!root) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onOverlayClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        className={"w-full " + SIZE_CLASS[size] + " rounded-2xl bg-[#1b1221] border border-white/10 shadow-2xl outline-none"}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-heading text-lg">{title}</h2>
          {showCloseX && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-white/70 hover:text-white rounded-full p-2"
            >
              ×
            </button>
          )}
        </div>
        <div className="px-6 py-5 text-white/90">
          {children}
        </div>
        {!hideCloseButton || footer ? (
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
            {footer}
            {!hideCloseButton && (
              <button
                className="rounded-full bg-[var(--brand-accent-orange)] text-slate-950 font-bold px-5 py-2"
                onClick={onClose}
                data-autofocus
              >
                Close
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    root
  );
}

function getPortalRoot() {
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  return root;
}
