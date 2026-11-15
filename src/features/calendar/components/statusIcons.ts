import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import type { MonthStatus } from "../infrastructure/plansApi";

export const statusIcons: Record<MonthStatus, typeof CircleCheck> = { ok: CircleCheck, watch: TriangleAlert, risk: OctagonAlert };
