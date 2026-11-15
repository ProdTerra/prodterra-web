"use client";

import { Check, Images, LoaderCircle, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useId, useRef, useState } from "react";
import { useDismissOnOutside } from "@/shared/components/useDismissOnOutside";
import { releasesWithChangesAt, type WaybackRelease } from "../infrastructure/waybackImagery";

type ImageryPickerProps = {
  selected: WaybackRelease | null;
  getCenter: () => { longitude: number; latitude: number } | null;
  onSelect: (release: WaybackRelease | null) => void;
};

type LoadState = { status: "idle" | "loading" | "failed" } | { status: "ready"; releases: WaybackRelease[] };

function olderReleasesByMonth(releases: WaybackRelease[], monthYear: (date: string) => string): WaybackRelease[] {
  const seenMonths = new Set<string>();
  return releases.slice(1).filter((release) => {
    const month = monthYear(release.date);
    if (seenMonths.has(month)) {
      return false;
    }
    seenMonths.add(month);
    return true;
  });
}

export function ImageryPicker({ selected, getCenter, onSelect }: ImageryPickerProps) {
  const translate = useTranslations("farmMapping.imagery");
  const format = useFormatter();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ status: "idle" });
  const close = useCallback(() => setIsOpen(false), []);
  useDismissOnOutside(isOpen, containerRef, close);

  const monthYear = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00Z`), { month: "short", year: "numeric", timeZone: "UTC" });

  async function open() {
    setIsOpen(true);
    const center = getCenter();
    if (!center) {
      return;
    }
    setLoadState({ status: "loading" });
    try {
      setLoadState({ status: "ready", releases: await releasesWithChangesAt(center) });
    } catch {
      setLoadState({ status: "failed" });
    }
  }

  function choose(release: WaybackRelease | null) {
    onSelect(release);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="imagery-picker">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => (isOpen ? close() : void open())}
        className="imagery-picker__toggle"
      >
        <Images aria-hidden size={16} />
        {selected ? translate("photoOf", { date: monthYear(selected.date) }) : translate("otherPhoto")}
      </button>
      {isOpen && (
        <div id={panelId} className="imagery-picker__panel">
          <div className="imagery-picker__header">
            <strong>{translate("title")}</strong>
            <button type="button" onClick={close} aria-label={translate("close")} className="icon-button">
              <X aria-hidden size={18} />
            </button>
          </div>
          <p className="imagery-picker__hint">{translate("hint")}</p>
          {loadState.status === "loading" && (
            <p className="imagery-picker__status">
              <LoaderCircle aria-hidden size={16} className="spin" />
              {translate("loading")}
            </p>
          )}
          {loadState.status === "failed" && <p className="imagery-picker__status">{translate("failed")}</p>}
          {loadState.status === "ready" && (
            <ul className="imagery-picker__list">
              <li>
                <button type="button" aria-pressed={selected === null} onClick={() => choose(null)} className="imagery-picker__option">
                  {translate("latest")}
                  {selected === null && <Check aria-hidden size={16} />}
                </button>
              </li>
              {olderReleasesByMonth(loadState.releases, monthYear).map((release) => (
                <li key={release.releaseNumber}>
                  <button
                    type="button"
                    aria-pressed={selected?.releaseNumber === release.releaseNumber}
                    onClick={() => choose(release)}
                    className="imagery-picker__option"
                  >
                    {monthYear(release.date)}
                    {selected?.releaseNumber === release.releaseNumber && <Check aria-hidden size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loadState.status === "ready" && olderReleasesByMonth(loadState.releases, monthYear).length === 0 && <p className="imagery-picker__status">{translate("noOthers")}</p>}
        </div>
      )}
    </div>
  );
}
