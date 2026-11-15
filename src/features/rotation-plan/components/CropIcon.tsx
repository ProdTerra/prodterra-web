import { Sprout } from "lucide-react";
import type { ReactNode } from "react";

const leafGreen = "#4f9a3a";
const darkGreen = "#2f6b2a";

const drawings: Record<string, ReactNode> = {
  potato: (
    <>
      <ellipse cx="16" cy="17" rx="11.5" ry="8.5" transform="rotate(-18 16 17)" fill="#c99a62" stroke="#8a6236" strokeWidth="1.2" />
      <circle cx="11" cy="15" r="1" fill="#8a6236" />
      <circle cx="18" cy="12.5" r="0.9" fill="#8a6236" />
      <circle cx="20.5" cy="19" r="1" fill="#8a6236" />
      <circle cx="14" cy="20.5" r="0.8" fill="#8a6236" />
    </>
  ),
  onion: (
    <>
      <path d="M16 8c-5 4.5-9 7.5-9 12.5C7 25 11 28 16 28s9-3 9-7.5C25 15.5 21 12.5 16 8z" fill="#b5577b" stroke="#86385a" strokeWidth="1.2" />
      <path d="M16 10.5c-2 4-3 7.5-3 10.5s1 5 3 6.5M16 10.5c2 4 3 7.5 3 10.5s-1 5-3 6.5" fill="none" stroke="#e7a9c2" strokeWidth="1" />
      <path d="M16 9V3M14 8.5 11.5 4M18 8.5 20.5 4" stroke={leafGreen} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  carrot: (
    <>
      <path d="M21.5 10.5 7 26c-.6.6.2 1.4.8.9L23.5 12.5z" fill="#ec8a2b" stroke="#b9621a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 21.5l2 1.5M15.5 18l1.8 1.4M18.5 15l1.5 1.2" stroke="#b9621a" strokeWidth="1" strokeLinecap="round" />
      <path d="M22.5 11.5c0-4 1-7 3.5-8.5M22.5 11.5c3-2 6-2.5 7.5-1.5M22.5 11.5c1.5-3.5 4.5-5.5 6.5-5.5" fill="none" stroke={leafGreen} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  cabbage: (
    <>
      <circle cx="16" cy="17" r="11" fill="#8fc46a" stroke="#5d9a3e" strokeWidth="1.2" />
      <path d="M16 6c-3 4-3 18 0 22M16 6c3 4 3 18 0 22M6.5 13c4 2 15 2 19 0M7 22c4-1.5 14-1.5 18 0" fill="none" stroke="#5d9a3e" strokeWidth="1" />
      <circle cx="16" cy="17" r="4.5" fill="#c3e3a1" />
    </>
  ),
  lettuce: (
    <>
      <path d="M16 27c-6 0-11-3.5-11-9 0-2 1.5-3 2.5-2.5C7 12 9.5 9.5 12 10.5 12.5 7.5 15 6 16 6s3.5 1.5 4 4.5c2.5-1 5 1.5 4.5 5 1-.5 2.5.5 2.5 2.5 0 5.5-5 9-11 9z" fill="#7fbf4d" stroke="#4f8f2c" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 26V12M16 19l-4.5-4M16 19l4.5-4M16 23.5l-6-3M16 23.5l6-3" fill="none" stroke="#c9e8a9" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  chayote: (
    <>
      <path d="M16 6c-3 0-5 2.5-5 5-3 2-5 5.5-5 9 0 5 4.5 8 10 8s10-3 10-8c0-3.5-2-7-5-9 0-2.5-2-5-5-5z" fill="#a9d36b" stroke="#6f9a35" strokeWidth="1.2" />
      <path d="M16 9v18M11.5 13c-1.5 4-1.5 9 1 13.5M20.5 13c1.5 4 1.5 9-1 13.5" fill="none" stroke="#6f9a35" strokeWidth="1" />
      <path d="M16 6.5V3.5" stroke={darkGreen} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  tomato: (
    <>
      <circle cx="16" cy="18" r="10.5" fill="#e2483d" stroke="#a92a22" strokeWidth="1.2" />
      <path d="M16 8.5l1.8 3.2 3.6-1.2-1.6 3.3 3.2 1.4-3.6.7M16 8.5l-1.8 3.2-3.6-1.2 1.6 3.3-3.2 1.4 3.6.7" fill={leafGreen} stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
      <path d="M16 9V5" stroke={darkGreen} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="11.5" cy="17" rx="1.6" ry="2.6" fill="#f3877e" transform="rotate(25 11.5 17)" />
    </>
  ),
  broccoli: (
    <>
      <path d="M13.5 18h5l1 10h-7z" fill="#8cc163" stroke="#5d8f37" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="10.5" cy="13.5" r="5" fill="#3f8f4f" stroke={darkGreen} strokeWidth="1.1" />
      <circle cx="21.5" cy="13.5" r="5" fill="#3f8f4f" stroke={darkGreen} strokeWidth="1.1" />
      <circle cx="16" cy="9.5" r="5.5" fill="#4ca35c" stroke={darkGreen} strokeWidth="1.1" />
      <circle cx="16" cy="16" r="4.5" fill="#3f8f4f" stroke={darkGreen} strokeWidth="1.1" />
    </>
  ),
  cauliflower: (
    <>
      <path d="M5 18c2 6 6 9 11 9s9-3 11-9c-3 2-6 2-11 2s-8 0-11-2z" fill={leafGreen} stroke={darkGreen} strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="10.5" cy="14.5" r="4.5" fill="#f4ecd2" stroke="#c9b98a" strokeWidth="1.1" />
      <circle cx="21.5" cy="14.5" r="4.5" fill="#f4ecd2" stroke="#c9b98a" strokeWidth="1.1" />
      <circle cx="16" cy="10.5" r="5" fill="#fbf5e3" stroke="#c9b98a" strokeWidth="1.1" />
      <circle cx="16" cy="16.5" r="4.5" fill="#f4ecd2" stroke="#c9b98a" strokeWidth="1.1" />
    </>
  ),
  strawberry: (
    <>
      <path d="M16 28c-5-3-10-8.5-10-13.5 0-3 2.5-4.5 5-4.5 2 0 3.5.8 5 .8s3-.8 5-.8c2.5 0 5 1.5 5 4.5 0 5-5 10.5-10 13.5z" fill="#e0384c" stroke="#a51f31" strokeWidth="1.2" strokeLinejoin="round" />
      <g fill="#f6d36b">
        <circle cx="12" cy="15" r="0.8" />
        <circle cx="16" cy="14.5" r="0.8" />
        <circle cx="20" cy="15" r="0.8" />
        <circle cx="13.5" cy="19.5" r="0.8" />
        <circle cx="18.5" cy="19.5" r="0.8" />
        <circle cx="16" cy="23.5" r="0.8" />
      </g>
      <path d="M16 11l-4-4 4.5 1L16 4l1.5 4 4.5-1-4 4z" fill={leafGreen} stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
    </>
  ),
  eggplant: (
    <>
      <path d="M12 12c-5 3-7 9-4.5 13.5S18 30 22 24c3-4.5 2-9.5-1.5-12.5-2.7-2.3-5.8-1.6-8.5.5z" fill="#6b3a8c" stroke="#45215e" strokeWidth="1.2" />
      <path d="M11 22c.5 2 2 3.5 4 4" fill="none" stroke="#a679c4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 12.5c2-3 6-4 9.5-1.5-1 2.5-4.5 3.5-9.5 1.5z" fill={leafGreen} stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
      <path d="M17 10.5 20 4" stroke={darkGreen} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  cilantro: (
    <>
      <path d="M16 29V15M16 20l-6-6M16 18l6-7M16 24l5-3" stroke="#5d8f37" strokeWidth="1.3" strokeLinecap="round" />
      <g fill="#6aaa3f" stroke="#3f7a26" strokeWidth="0.9">
        <path d="M16 15c-2.5-1-3-4-1-5.5 1-.8 2-.8 2 0 2 1.5 1.5 4.5-1 5.5z" />
        <path d="M10 14c-2.5.5-4.5-1.5-4-4 .3-1.2 1.2-1.6 1.8-1.1 2.3-.4 3.4 2.4 2.2 5.1z" />
        <path d="M22 11c.2-2.5 2.8-4 5-2.6 1 .6 1.2 1.6.6 2.1-.2 2.4-3.2 3.1-5.6.5z" />
        <path d="M21 21c1.5-2 4.5-2 5.5.3.5 1.1.1 2-.6 2.1-1.4 1.9-4.3 1.1-4.9-2.4z" />
      </g>
    </>
  ),
  "sweet-pepper": (
    <>
      <path d="M9 13c-3 3-3 9-.5 12.5 2 2.8 5 3 7.5 1.5 2.5 1.5 5.5 1.3 7.5-1.5 2.5-3.5 2.5-9.5-.5-12.5-2-2-5-1.5-7 0-2-1.5-5-2-7 0z" fill="#d93a2e" stroke="#9e231a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 13v13" stroke="#9e231a" strokeWidth="1" />
      <path d="M12.5 15c-1 2.5-1 6 .5 8.5" fill="none" stroke="#f28a7f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13 12.5c1-1.5 5-1.5 6 0M16 12V7.5c0-1.5 1.5-2.5 3-2.5" fill="none" stroke={darkGreen} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  avocado: (
    <>
      <path d="M16 4c-3 0-4.5 4-5.5 8-1 4-4.5 6.5-4.5 10.5C6 26.5 10.5 29 16 29s10-2.5 10-6.5c0-4-3.5-6.5-4.5-10.5C20.5 8 19 4 16 4z" fill="#3e6b25" stroke="#284a16" strokeWidth="1.2" />
      <path d="M16 8c-2 0-3 3-3.7 6-.8 3-3.3 5-3.3 8 0 3 3 4.5 7 4.5s7-1.5 7-4.5c0-3-2.5-5-3.3-8-.7-3-1.7-6-3.7-6z" fill="#cfe08a" />
      <circle cx="16" cy="20.5" r="4" fill="#8a5a2b" stroke="#5e3b18" strokeWidth="1" />
      <circle cx="14.8" cy="19.3" r="1" fill="#b27c46" />
    </>
  ),
  cassava: (
    <>
      <path d="M6 9c5-1 9 1 13 6s7 10 8 13c-3-1-8-4-12-8S6 12 6 9z" fill="#9b6a3c" stroke="#6b4423" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M11 6c4 0 8 3 11 8s4 9 4 11c-2-1-6-5-9-9s-6-8-6-10z" fill="#b8844f" stroke="#6b4423" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M13 12l2 1.5M17 15.5l1.8 1.5M20.5 19.5l1.5 1.4" stroke="#6b4423" strokeWidth="1" strokeLinecap="round" />
      <path d="M9 7.5 6 3M10.5 6.5 11 2.5M8 8 3.5 6" stroke={leafGreen} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  sugarcane: (
    <>
      <g stroke="#7a8a2a" strokeWidth="1.1">
        <rect x="9" y="6" width="5" height="23" rx="1.5" fill="#c5c95a" />
        <rect x="17" y="9" width="5" height="20" rx="1.5" fill="#b3bb4a" />
      </g>
      <path d="M9 13h5M9 20h5M17 15h5M17 22h5" stroke="#7a8a2a" strokeWidth="1.3" />
      <path d="M11.5 6C9 3 6 2.5 4 3.5M11.5 6c2-3 5-4 7.5-3.5M19.5 9c2.5-3 5.5-3.5 8-2.5" fill="none" stroke={leafGreen} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 27C10 20 18 12 28 6" fill="none" stroke="#6b4423" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 21c-4-1-6-4-5.5-7 3 0 5.5 2.5 5.5 7zM22 9c1-4 4-6 7-5.5 0 3-2.5 5.5-7 5.5z" fill={leafGreen} stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
      <g fill="#c62f2f" stroke="#8c1c1c" strokeWidth="1">
        <ellipse cx="14" cy="17.5" rx="3" ry="3.4" />
        <ellipse cx="18.5" cy="15" rx="3" ry="3.4" />
        <ellipse cx="16.5" cy="21" rx="3" ry="3.4" />
      </g>
      <path d="M13.5 16.5c.5-.5 1-.5 1.5 0M18 14c.5-.5 1-.5 1.5 0M16 20c.5-.5 1-.5 1.5 0" fill="none" stroke="#f08b8b" strokeWidth="0.9" strokeLinecap="round" />
    </>
  ),
  maize: (
    <>
      <ellipse cx="17" cy="13" rx="5" ry="9.5" transform="rotate(20 17 13)" fill="#f2c94c" stroke="#b8901d" strokeWidth="1.2" />
      <path d="M13.5 8.5l7 2.5M12.5 12l7.5 2.7M12 15.8l6.5 2.4M15 5.5l5.5 2" stroke="#d6a72c" strokeWidth="0.9" />
      <path d="M8 13c2 6 4 12 9 16-5 0-9-3-10.5-8C5.5 17.5 6 15 8 13z" fill={leafGreen} stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
      <path d="M24 17c0 5-2.5 9.5-7 12 1.5-4 3-8 3-12.5 1.5-.5 3 0 4 .5z" fill="#6fae47" stroke={darkGreen} strokeWidth="1" strokeLinejoin="round" />
    </>
  ),
};

export function hasCropIcon(cropKey: string): boolean {
  return cropKey in drawings;
}

export function CropIcon({ cropKey, size = 24 }: { cropKey: string; size?: number }) {
  const drawing = drawings[cropKey];
  if (!drawing) {
    return <Sprout aria-hidden size={size} />;
  }
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 32 32" className="crop-icon">
      {drawing}
    </svg>
  );
}
