"use client";

import { useTranslations } from "next-intl";
import { useRef, type PointerEvent } from "react";

const swipeThresholdInPixels = 30;

type PanelSheetHandleProps = {
  isExpanded: boolean;
  onChange: (isExpanded: boolean) => void;
};

export function PanelSheetHandle({ isExpanded, onChange }: PanelSheetHandleProps) {
  const translate = useTranslations("farmMapping");
  const startYRef = useRef<number | null>(null);
  const wasSwipeRef = useRef(false);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    startYRef.current = event.clientY;
    wasSwipeRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const startY = startYRef.current;
    startYRef.current = null;
    if (startY === null) {
      return;
    }
    const distance = event.clientY - startY;
    if (distance <= -swipeThresholdInPixels) {
      wasSwipeRef.current = true;
      onChange(true);
    } else if (distance >= swipeThresholdInPixels) {
      wasSwipeRef.current = true;
      onChange(false);
    }
  }

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-label={translate(isExpanded ? "showMoreMap" : "showMorePanel")}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startYRef.current = null;
      }}
      onClick={() => {
        if (!wasSwipeRef.current) {
          onChange(!isExpanded);
        }
      }}
      className="panel-sheet-handle"
    >
      <span aria-hidden />
    </button>
  );
}
