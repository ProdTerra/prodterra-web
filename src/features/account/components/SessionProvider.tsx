"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchCurrentUser, logOut, type AccountUser } from "../infrastructure/authApi";

type SessionStatus = "checking" | "anonymous" | "authenticated";

type SessionValue = {
  status: SessionStatus;
  user: AccountUser | null;
  isAuthDialogOpen: boolean;
  openAuthDialog: (afterSignIn?: () => void) => void;
  closeAuthDialog: () => void;
  signedIn: (user: AccountUser) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const afterSignInRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then((currentUser) => {
        setUser(currentUser);
        setStatus(currentUser ? "authenticated" : "anonymous");
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
      openAuthDialog: (afterSignIn?: () => void) => {
        afterSignInRef.current = afterSignIn ?? null;
        setIsAuthDialogOpen(true);
      },
      closeAuthDialog: () => {
        afterSignInRef.current = null;
        setIsAuthDialogOpen(false);
      },
      signedIn,
      signOut,
    }),
    [status, user, isAuthDialogOpen, signedIn, signOut],
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
