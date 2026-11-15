"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { readGoogleSignInError, type AccountErrorCode, type AccountFormMode } from "../domain/accountForm";
import { fetchCurrentUser, logOut, type AccountUser } from "../infrastructure/authApi";

type SessionStatus = "checking" | "anonymous" | "authenticated";

export type AuthDialogRequest = { id: number; mode: AccountFormMode; errorCode: AccountErrorCode | null };

const accountLinkParameter = "account";
const authErrorParameter = "authError";

function takeAuthDialogRequestFromUrl(): Omit<AuthDialogRequest, "id"> | null {
  const url = new URL(window.location.href);
  const errorCode = readGoogleSignInError(url.searchParams.get(authErrorParameter));
  const wantsPasswordReset = url.searchParams.get(accountLinkParameter) === "forgotPassword";
  if (!errorCode && !wantsPasswordReset) {
    return null;
  }
  url.searchParams.delete(authErrorParameter);
  url.searchParams.delete(accountLinkParameter);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return { mode: wantsPasswordReset ? "forgot" : "login", errorCode };
}

type SessionValue = {
  status: SessionStatus;
  user: AccountUser | null;
  isAuthDialogOpen: boolean;
  authDialogRequest: AuthDialogRequest;
  openAuthDialog: (afterSignIn?: () => void) => void;
  closeAuthDialog: () => void;
  signedIn: (user: AccountUser) => void;
  updatedUser: (user: AccountUser) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authDialogRequest, setAuthDialogRequest] = useState<AuthDialogRequest>({ id: 0, mode: "login", errorCode: null });
  const afterSignInRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then((currentUser) => {
        setUser(currentUser);
        setStatus(currentUser ? "authenticated" : "anonymous");
        const requestFromUrl = takeAuthDialogRequestFromUrl();
        if (requestFromUrl && !(currentUser && requestFromUrl.mode === "login")) {
          setAuthDialogRequest((current) => ({ id: current.id + 1, ...requestFromUrl }));
          setIsAuthDialogOpen(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus("anonymous");
        }
      });
    return () => controller.abort();
  }, []);

  const signedIn = useCallback((signedInUser: AccountUser) => {
    setUser(signedInUser);
    setStatus("authenticated");
    setIsAuthDialogOpen(false);
    const afterSignIn = afterSignInRef.current;
    afterSignInRef.current = null;
    afterSignIn?.();
  }, []);

  const signOut = useCallback(async () => {
    await logOut().catch(() => undefined);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthDialogOpen,
      authDialogRequest,
      openAuthDialog: (afterSignIn?: () => void) => {
        afterSignInRef.current = afterSignIn ?? null;
        setAuthDialogRequest((current) => ({ id: current.id + 1, mode: "login", errorCode: null }));
        setIsAuthDialogOpen(true);
      },
      closeAuthDialog: () => {
        afterSignInRef.current = null;
        setIsAuthDialogOpen(false);
      },
      signedIn,
      updatedUser: setUser,
      signOut,
    }),
    [status, user, isAuthDialogOpen, authDialogRequest, signedIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return value;
}
