"use client";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { AccountTextField } from "@/features/account/components/AccountTextField";
import { useSession } from "@/features/account/components/SessionProvider";
import type { FarmMappingState } from "@/features/farm-mapping/application/farmMappingState";
import { useSavedRotationPlan } from "@/features/rotation-plan/components/useRotationPlan";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import { buildSnapshot, validateFarmName } from "../domain/savedFarm";
import { loadActiveSavedFarm, rememberActiveSavedFarm } from "../infrastructure/activeSavedFarmStorage";
import { saveFarm, SavedFarmsError, type SavedFarmsFailure } from "../infrastructure/savedFarmsApi";

type SaveOutcome = { kind: "saved"; name: string } | { kind: "failed"; reason: SavedFarmsFailure } | null;

export function SavePlanButton({ farmState }: { farmState: FarmMappingState }) {
  const translate = useTranslations("savedFarms");
  const titleId = useId();
  const { status, openAuthDialog } = useSession();
  const plan = useSavedRotationPlan(farmState.lots.map((lot) => lot.shapeId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outcome, setOutcome] = useState<SaveOutcome>(null);
  const dialogProps = useModalDialog(isDialogOpen, () => setIsDialogOpen(false));
  const nameError = validateFarmName(name);

  function openSaveDialog() {
    const storage = getBrowserStorage();
    const activeFarm = storage ? loadActiveSavedFarm(storage) : null;
    setName(activeFarm?.name ?? translate("defaultName"));
    setIsNameTouched(false);
    setOutcome(null);
    setIsDialogOpen(true);
  }

  function handleClick() {
    if (status === "authenticated") {
      openSaveDialog();
      return;
    }
    openAuthDialog(openSaveDialog);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsNameTouched(true);
    const snapshot = buildSnapshot(farmState, plan);
    if (nameError || !snapshot) {
      return;
    }
    const storage = getBrowserStorage();
    const activeFarm = storage ? loadActiveSavedFarm(storage) : null;
    setIsSaving(true);
    try {
      const saved = await saveFarm(activeFarm?.id ?? null, name.trim(), snapshot).catch((error: unknown) => {
        if (error instanceof SavedFarmsError && error.reason === "notFound") {
          return saveFarm(null, name.trim(), snapshot);
        }
        throw error;
      });
      if (storage) {
        rememberActiveSavedFarm(storage, { id: saved.id, name: saved.name });
      }
      setOutcome({ kind: "saved", name: saved.name });
      setIsDialogOpen(false);
    } catch (error) {
      setOutcome({ kind: "failed", reason: error instanceof SavedFarmsError ? error.reason : "unavailable" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className="button button--primary">
        <Save aria-hidden size={18} />
        {translate("saveAction")}
      </button>
      {outcome?.kind === "saved" && (
        <div className="save-plan__outcome">
          <Notice tone="success">
            {translate("saved", { name: outcome.name })} <Link href="/farms">{translate("goToFarms")}</Link>
          </Notice>
        </div>
      )}
      <dialog {...dialogProps} aria-labelledby={titleId} className="dialog">
        <form noValidate onSubmit={handleSubmit} className="dialog__body auth-dialog__body">
          <div>
            <h2 id={titleId} className="dialog__title">
              {translate("dialogTitle")}
            </h2>
            <p className="dialog__description">{translate("dialogDescription")}</p>
          </div>
          {outcome?.kind === "failed" && <Notice tone="error">{translate(`errors.${outcome.reason}`)}</Notice>}
          <AccountTextField
            label={translate("nameLabel")}
            type="text"
            value={name}
            autoComplete="off"
            error={isNameTouched && nameError ? translate(`errors.${nameError}`) : null}
            hint={translate("nameHint")}
            onChange={setName}
            onBlur={() => setIsNameTouched(true)}
          />
          <div className="dialog__actions">
            <button type="button" onClick={() => setIsDialogOpen(false)} className="button button--outline">
              {translate("cancel")}
            </button>
            <button type="submit" disabled={isSaving} className="button button--primary">
              {isSaving ? <LoaderCircle aria-hidden size={18} className="spin" /> : <Save aria-hidden size={18} />}
              {translate(isSaving ? "saving" : "confirmSave")}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
