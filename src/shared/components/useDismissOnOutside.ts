import { useEffect, type RefObject } from "react";

export function useDismissOnOutside(isOpen: boolean, containerRef: RefObject<HTMLElement | null>, onDismiss: () => void) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onDismiss();
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, containerRef, onDismiss]);
}
