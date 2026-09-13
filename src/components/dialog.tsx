"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
export function Dialog({
  open,
  onClose,
  title,
  children,
  drawer = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      const previous = document.activeElement as HTMLElement | null;
      dialog.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        dialog.close();
        document.body.style.overflow = overflow;
        previous?.focus();
      };
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={drawer ? "dialog drawer" : "dialog"}
      aria-labelledby={heading}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-heading">
        <h2 id={heading}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
