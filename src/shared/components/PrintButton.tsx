"use client";

import { FileDown } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="button button--outline">
      <FileDown aria-hidden size={18} />
      {label}
    </button>
  );
}
