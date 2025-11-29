
import { useCallback, useState } from "react";

export function useModal(initial = false) {
  const [isOpen, setOpen] = useState<boolean>(initial);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(v => !v), []);
  return { isOpen, open, close, toggle, setOpen };
}
