"use client";

import { FolderOpen, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { initialsOf } from "../domain/accountForm";
import { useSession } from "./SessionProvider";

export function AccountMenu() {
  const translate = useTranslations("account");
  const { status, user, openAuthDialog, signOut } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (status === "checking") {
    return <span aria-hidden className="account-avatar account-avatar--placeholder" />;
  }

  if (!user) {
    return (
      <button type="button" onClick={openAuthDialog} className="button button--secondary button--small">
        <LogIn aria-hidden size={16} />
        {translate("openLogin")}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="account-menu">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={translate("profileLabel", { name: user.name })}
        onClick={() => setIsOpen((open) => !open)}
        className="account-avatar"
      >
        {initialsOf(user.name)}
      </button>
      {isOpen && (
        <div id={menuId} role="menu" className="account-menu__panel">
          <div className="account-menu__identity">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link role="menuitem" href="/farms" onClick={() => setIsOpen(false)} className="account-menu__item">
            <FolderOpen aria-hidden size={18} />
            {translate("myFarms")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
            className="account-menu__item"
          >
            <LogOut aria-hidden size={18} />
            {translate("logOut")}
          </button>
        </div>
      )}
    </div>
  );
}
