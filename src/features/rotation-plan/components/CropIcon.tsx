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
