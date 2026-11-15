"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, logOut, type AccountUser } from "../infrastructure/authApi";

type SessionStatus = "checking" | "anonymous" | "authenticated";

type SessionValue = {
  status: SessionStatus;
  user: AccountUser | null;
  isAuthDialogOpen: boolean;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
  signedIn: (user: AccountUser) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

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
      openAuthDialog: () => setIsAuthDialogOpen(true),
      closeAuthDialog: () => setIsAuthDialogOpen(false),
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
