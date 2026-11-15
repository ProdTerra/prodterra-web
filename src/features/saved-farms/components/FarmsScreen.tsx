"use client";

import { ArrowLeft, FolderOpen, LogIn, Map, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { useSession } from "@/features/account/components/SessionProvider";
import { Dialog } from "@/shared/components/Dialog";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { Notice } from "@/shared/components/Notice";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import type { SavedFarmSummary } from "../domain/savedFarm";
import { openSavedFarmInPlanner } from "../infrastructure/activeSavedFarmStorage";
import { deleteSavedFarm, getSavedFarm, listSavedFarms, SavedFarmsError, type SavedFarmsFailure } from "../infrastructure/savedFarmsApi";

type FarmsState = { status: "loading" } | { status: "ready"; farms: SavedFarmSummary[] } | { status: "failed"; reason: SavedFarmsFailure };

function reasonOf(error: unknown): SavedFarmsFailure {
  return error instanceof SavedFarmsError ? error.reason : "unavailable";
}

export function FarmsScreen() {
  const translate = useTranslations("savedFarms");
  const format = useFormatter();
  const router = useRouter();
  const { status, openAuthDialog } = useSession();
  const [state, setState] = useState<FarmsState>({ status: "loading" });
  const [farmToDelete, setFarmToDelete] = useState<SavedFarmSummary | null>(null);
  const [actionError, setActionError] = useState<SavedFarmsFailure | null>(null);

  const fetchFarms = useCallback(() => {
    listSavedFarms()
      .then((farms) => setState({ status: "ready", farms }))
      .catch((error: unknown) => setState({ status: "failed", reason: reasonOf(error) }));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFarms();
    }
  }, [status, fetchFarms]);

  function loadFarms() {
    setState({ status: "loading" });
    fetchFarms();
  }

  async function openFarm(farmId: string) {
    setActionError(null);
    try {
      const farm = await getSavedFarm(farmId);
      const storage = getBrowserStorage();
      if (storage) {
        openSavedFarmInPlanner(storage, farm);
      }
      router.push("/");
    } catch (error) {
      setActionError(reasonOf(error));
    }
  }

  async function confirmDelete() {
    const farm = farmToDelete;
    setFarmToDelete(null);
    if (!farm) {
      return;
    }
    try {
      await deleteSavedFarm(farm.id);
      setState((current) =>
        current.status === "ready" ? { status: "ready", farms: current.farms.filter((saved) => saved.id !== farm.id) } : current,
      );
    } catch (error) {
      setActionError(reasonOf(error));
    }
  }

  const savedOn = (isoDate: string) =>
    format.dateTime(new Date(isoDate), { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="farms-screen">
      <header className="panel-header farms-screen__header">
        <Link href="/" className="brand">
          ProdTerra
        </Link>
        <div className="panel-header__actions">
          <LanguageSwitcher />
          <AccountMenu />
        </div>
      </header>

      <div className="farms-screen__title">
        <div>
          <h1 className="step-title">{translate("pageTitle")}</h1>
          <p className="step-hint">{translate("pageHint")}</p>
        </div>
        <Link href="/" className="button button--secondary">
          <ArrowLeft aria-hidden size={18} />
          {translate("backToPlanner")}
        </Link>
      </div>

      {status === "anonymous" && (
        <section className="farms-empty">
          <h2>{translate("loginTitle")}</h2>
          <p>{translate("loginHint")}</p>
          <button type="button" onClick={() => openAuthDialog()} className="button button--primary">
            <LogIn aria-hidden size={18} />
            {translate("loginTitle")}
          </button>
        </section>
      )}

      {status === "authenticated" && (
        <>
          {actionError && <Notice tone="error">{translate(`errors.${actionError}`)}</Notice>}
          {state.status === "loading" && <Notice tone="loading">{translate("loading")}</Notice>}
          {state.status === "failed" && (
            <Notice tone="error" action={{ label: translate("retry"), onClick: loadFarms, icon: RotateCcw }}>
              {translate(`errors.${state.reason}`)}
            </Notice>
          )}
          {state.status === "ready" && state.farms.length === 0 && (
            <section className="farms-empty">
              <h2>{translate("emptyTitle")}</h2>
              <p>{translate("empty")}</p>
              <Link href="/" className="button button--primary">
                <Map aria-hidden size={18} />
                {translate("planFarm")}
              </Link>
            </section>
          )}
          {state.status === "ready" && state.farms.length > 0 && (
            <ul className="farm-list">
              {state.farms.map((farm) => (
                <li key={farm.id} className="farm-card">
                  <div className="farm-card__text">
                    <h2>{farm.name}</h2>
                    <p>
                      {translate("lots", { count: farm.lotCount })}. {translate("updated", { date: savedOn(farm.updatedAt) })}
                    </p>
                  </div>
                  <div className="farm-card__actions">
                    <button type="button" onClick={() => void openFarm(farm.id)} className="button button--primary">
                      <FolderOpen aria-hidden size={18} />
                      {translate("open")}
                    </button>
                    <button type="button" onClick={() => setFarmToDelete(farm)} className="button button--danger-outline">
                      <Trash2 aria-hidden size={18} />
                      {translate("delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Dialog
        isOpen={farmToDelete !== null}
        tone="danger"
        title={translate("deleteTitle", { name: farmToDelete?.name ?? "" })}
        description={translate("deleteDescription")}
        confirmLabel={translate("deleteConfirm")}
        cancelLabel={translate("deleteCancel")}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setFarmToDelete(null)}
      />
    </main>
  );
}
