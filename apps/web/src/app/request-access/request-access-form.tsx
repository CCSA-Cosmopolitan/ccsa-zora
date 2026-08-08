"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { Button } from "@ccsa-zora/ui/components/button";
import { Card, CardContent } from "@ccsa-zora/ui/components/card";

const roleOptions = [
  ["farmer_or_producer", "Farmer or producer"],
  ["extension_professional", "Extension professional"],
  ["researcher_or_scientist", "Researcher or climate scientist"],
  ["programme_manager", "Institution or programme manager"],
  ["mrv_or_verification_professional", "MRV or verification professional"],
  ["technology_or_data_partner", "Technology or data partner"],
  ["other", "Other"],
] as const;

export function AccessRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          organizationName: data.get("organizationName"),
          requestedRole: data.get("requestedRole"),
          country: data.get("country"),
          useCase: data.get("useCase"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to submit your request");
      form.reset();
      setComplete(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <Card className="border-zora-forest/15 bg-white shadow-2xl shadow-zora-deep/8">
        <CardContent className="p-7 text-center sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-zora-mist text-zora-forest">
            <CheckCircle2 className="size-7" />
          </span>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-zora-deep">
            Request received
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Your request is in the institutional review queue. A Zora administrator will contact you
            using the work email supplied.
          </p>
          <Button asChild className="mt-7 rounded-xl" variant="outline">
            <Link href="/">Return to Zora</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 font-normal outline-none transition focus:border-zora-forest focus:ring-2 focus:ring-ring";

  return (
    <Card className="border-zora-forest/15 bg-white shadow-2xl shadow-zora-deep/8">
      <CardContent className="p-6 sm:p-8">
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={submitRequest}>
          <label className="block text-sm font-semibold text-zora-deep">
            Full name
            <input
              autoComplete="name"
              className={inputClass}
              maxLength={120}
              minLength={2}
              name="fullName"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-zora-deep">
            Work email
            <input
              autoComplete="email"
              className={inputClass}
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm font-semibold text-zora-deep">
            Organization
            <input
              autoComplete="organization"
              className={inputClass}
              maxLength={180}
              minLength={2}
              name="organizationName"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-zora-deep">
            Your role
            <select className={inputClass} defaultValue="" name="requestedRole" required>
              <option disabled value="">
                Select a role
              </option>
              {roleOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-zora-deep sm:col-span-2">
            Country or operating region{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
            <input
              autoComplete="country-name"
              className={inputClass}
              maxLength={100}
              name="country"
            />
          </label>
          <label className="block text-sm font-semibold text-zora-deep sm:col-span-2">
            How would your team use Zora?
            <textarea
              className="mt-1.5 min-h-32 w-full resize-y rounded-xl border border-input bg-white px-3 py-3 font-normal leading-6 outline-none transition focus:border-zora-forest focus:ring-2 focus:ring-ring"
              maxLength={1200}
              minLength={20}
              name="useCase"
              required
            />
          </label>

          <label
            aria-hidden="true"
            className="absolute -left-[10000px] top-auto size-px overflow-hidden"
          >
            Website
            <input autoComplete="off" name="website" tabIndex={-1} />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-zora-forest/10 bg-zora-mist/55 p-4 text-xs leading-5 text-muted-foreground sm:col-span-2">
            <input
              className="mt-0.5 size-4 shrink-0 accent-zora-forest"
              name="consent"
              required
              type="checkbox"
            />
            <span>
              I agree that CCSA Zora may use these details to evaluate this access request and
              contact me about workspace onboarding.
            </span>
          </label>

          {error ? (
            <p
              aria-live="polite"
              className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5 text-zora-forest" /> Requests are reviewed before
              accounts are created.
            </p>
            <Button className="h-11 rounded-xl px-6" disabled={submitting} type="submit">
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" /> Sending request…
                </>
              ) : (
                "Request workspace access"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
