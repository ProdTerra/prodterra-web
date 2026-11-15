"use client";

import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Notice } from "@/shared/components/Notice";
import { useState, type FormEvent } from "react";
import { requestCurrentPosition } from "../infrastructure/currentPosition";
import { searchPlaces, type PlaceResult } from "../infrastructure/placeSearch";
import type { MapCoordinates } from "./SatelliteMap";

type LocateStepProps = {
  onMoveMap: (coordinates: MapCoordinates) => void;
  onConfirm: () => void;
};

type SearchStatus = "idle" | "searching" | "empty" | "failed" | "found";
type LocatingStatus = "idle" | "locating" | "denied" | "unavailable";

export function LocateStep({ onMoveMap, onConfirm }: LocateStepProps) {
  const translate = useTranslations("farmMapping.locate");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [locatingStatus, setLocatingStatus] = useState<LocatingStatus>("idle");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }
    setSearchStatus("searching");
    try {
      const places = await searchPlaces(trimmedQuery, locale);
      setResults(places);
      setSearchStatus(places.length > 0 ? "found" : "empty");
    } catch {
      setResults([]);
      setSearchStatus("failed");
    }
  }

  async function handleUseMyLocation() {
    setLocatingStatus("locating");
    const position = await requestCurrentPosition();
    if (position.found) {
      setLocatingStatus("idle");
      onMoveMap(position);
      return;
    }
    setLocatingStatus(position.failure);
  }

  function handleChoosePlace(place: PlaceResult) {
    setResults([]);
    setSearchStatus("idle");
    setQuery(place.label.split(",")[0]);
    onMoveMap(place);
  }

  function handleClearSearch() {
    setQuery("");
    setResults([]);
    setSearchStatus("idle");
  }

  return (
    <div className="step-content">
      <h1 className="step-title">{translate("title")}</h1>
      <p className="step-hint">{translate("hint")}</p>

      <form role="search" onSubmit={handleSearch} className="search-form">
        <label htmlFor="place-search" className="visually-hidden">
          {translate("searchLabel")}
        </label>
        <Search aria-hidden className="search-form__icon" size={18} />
        <input
          id="place-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={translate("searchPlaceholder")}
          autoComplete="off"
          className="search-form__input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label={translate("clearSearch")}
            className="search-form__clear"
          >
            <X aria-hidden size={16} />
          </button>
        )}
        <button type="submit" className="button button--search" disabled={searchStatus === "searching"}>
          {searchStatus === "searching" ? translate("searching") : translate("searchAction")}
        </button>
      </form>

      {searchStatus === "found" && (
        <ul aria-label={translate("resultsLabel")} className="place-results">
          {results.map((place) => (
            <li key={place.placeId}>
              <button type="button" onClick={() => handleChoosePlace(place)}>
                <MapPin aria-hidden size={16} />
                <span>{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {searchStatus === "empty" && <Notice tone="info">{translate("noResults")}</Notice>}
      {searchStatus === "failed" && <Notice tone="error">{translate("searchFailed")}</Notice>}

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locatingStatus === "locating"}
        className="button button--outline"
      >
        <LocateFixed aria-hidden size={18} />
        {locatingStatus === "locating" ? translate("locating") : translate("useMyLocation")}
      </button>
      {locatingStatus === "denied" && <Notice tone="error">{translate("locationDenied")}</Notice>}
      {locatingStatus === "unavailable" && <Notice tone="error">{translate("locationUnavailable")}</Notice>}

      <div className="step-actions">
        <button type="button" onClick={onConfirm} className="button button--primary">
          {translate("confirm")}
        </button>
      </div>
    </div>
  );
}
