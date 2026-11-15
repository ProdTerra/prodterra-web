import { ResetPasswordScreen } from "@/features/account/components/ResetPasswordScreen";

type ResetPasswordPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={typeof token === "string" ? token : ""} />;
}
