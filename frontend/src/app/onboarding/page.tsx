import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user.onboarded) redirect("/dashboard");

  return (
    <div className="container-mantis grid min-h-[80vh] place-items-center pt-24 pb-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="display text-3xl sm:text-5xl">How will you use Mantis?</h1>
        <p className="mt-3 text-muted">
          Choose your account type. This is fixed for the account, so a person and a company stay
          separate.
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}
