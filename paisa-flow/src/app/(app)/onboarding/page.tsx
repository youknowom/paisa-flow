"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { CURRENCIES, PAYMENT_MODES } from "@/lib/constants";
import { LottieAnimation } from "@/components/shared/lottie-animation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "welcome",
  "currency",
  "budget",
  "purpose",
  "confirm",
] as const;

type Step = (typeof STEPS)[number];

const STEP_LOTTIES: Record<Step, string> = {
  welcome:
    "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie",
  currency:
    "https://lottie.host/f2a3ec55-5771-4498-b230-7e5070e27e25/gKzXgYHPgI.lottie",
  budget:
    "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie",
  purpose:
    "https://lottie.host/a0e8038b-d250-42be-9b78-4a6c62b5db21/bR4MzcRfKi.lottie",
  confirm:
    "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie",
};

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");
  const [defaultPaymentMode, setDefaultPaymentMode] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        currency,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
        defaultPaymentMode: defaultPaymentMode || undefined,
      });
      toast.success("Welcome to PaisaFlow! Let's manage your money.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete setup"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 px-4">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < currentStep
                ? "w-1.5 bg-accent"
                : i === currentStep
                  ? "w-8 bg-accent"
                  : "w-1.5 bg-surface-3"
            )}
          />
        ))}
      </div>

      {/* Illustration area - 60% */}
      <div className="flex-[3] relative flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 60%, #0A0A0A 100%)",
          }}
        />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10"
          >
            <LottieAnimation
              url={STEP_LOTTIES[step]}
              width={280}
              height={280}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content area - 40% */}
      <div className="flex-[2] px-6 pb-8 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {step === "welcome" && (
              <>
                <h1 className="text-[28px] font-bold text-text-primary font-heading leading-tight">
                  Welcome to PaisaFlow
                </h1>
                <p className="text-body-lg text-text-muted mt-3">
                  Track spending. Split trips. Settle smarter. Setup takes 30
                  seconds.
                </p>
              </>
            )}

            {step === "currency" && (
              <>
                <h2 className="text-[28px] font-bold text-text-primary font-heading">
                  Choose your currency
                </h2>
                <p className="text-body-lg text-text-muted mt-2 mb-4">
                  Used to format all your expenses.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-scroll scroll-smooth-y no-scrollbar">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCurrency(c.value)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        currency === c.value
                          ? "bg-accent/15 border-accent/40 text-accent"
                          : "bg-surface-2 border-border-subtle text-text-secondary"
                      )}
                    >
                      <span className="text-xl">{c.symbol}</span>
                      <p className="text-caption mt-1 font-medium truncate">
                        {c.label}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "budget" && (
              <>
                <h2 className="text-[28px] font-bold text-text-primary font-heading">
                  Monthly budget
                </h2>
                <p className="text-body-lg text-text-muted mt-2 mb-4">
                  Optional — we&apos;ll alert you when you&apos;re close.
                </p>
                <div className="flex items-baseline gap-1 border-b border-border-subtle pb-2 mb-4">
                  <span className="text-xl text-text-muted font-mono-amount">
                    {CURRENCIES.find((c) => c.value === currency)?.symbol ||
                      "₹"}
                  </span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="30000"
                    className="flex-1 bg-transparent text-3xl font-mono-amount text-text-primary outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_MODES.map((pm) => (
                    <button
                      key={pm.value}
                      onClick={() => setDefaultPaymentMode(pm.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-caption font-medium border",
                        defaultPaymentMode === pm.value
                          ? "bg-accent/15 border-accent/40 text-accent"
                          : "bg-surface-2 border-border-subtle text-text-muted"
                      )}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "purpose" && (
              <>
                <h2 className="text-[28px] font-bold text-text-primary font-heading">
                  What brings you here?
                </h2>
                <p className="text-body-lg text-text-muted mt-2 mb-4">
                  We&apos;ll tailor your experience.
                </p>
                <div className="space-y-2">
                  {[
                    {
                      value: "daily",
                      label: "Track Daily Spending",
                      desc: "Monitor expenses and budgets",
                      icon: Wallet,
                    },
                    {
                      value: "trips",
                      label: "Split Trip Expenses",
                      desc: "Group costs and settle debts",
                      icon: MapPin,
                    },
                    {
                      value: "both",
                      label: "Both",
                      desc: "The full experience",
                      icon: Sparkles,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPurpose(opt.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all",
                        purpose === opt.value
                          ? "bg-accent/15 border-accent/40"
                          : "bg-surface-2 border-border-subtle"
                      )}
                    >
                      <opt.icon
                        size={20}
                        className={
                          purpose === opt.value
                            ? "text-accent"
                            : "text-text-muted"
                        }
                      />
                      <div>
                        <p className="font-semibold text-text-primary text-sm font-heading">
                          {opt.label}
                        </p>
                        <p className="text-caption text-text-muted">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "confirm" && (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                  <Check className="text-accent" size={32} />
                </div>
                <h2 className="text-[28px] font-bold text-text-primary font-heading">
                  You&apos;re all set!
                </h2>
                <p className="text-body-lg text-text-muted mt-2">
                  Ready to take control of your finances?
                </p>
                <div className="mt-4 card-surface p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Currency</span>
                    <span className="text-text-primary">
                      {CURRENCIES.find((c) => c.value === currency)?.label}
                    </span>
                  </div>
                  {monthlyBudget && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Budget</span>
                      <span className="font-mono-amount">
                        {CURRENCIES.find((c) => c.value === currency)?.symbol}
                        {parseFloat(monthlyBudget).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4 mt-6">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors py-3"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="min-w-[140px]">
              Continue
              <ArrowRight size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              loading={isSubmitting}
              className="min-w-[160px]"
            >
              Launch PaisaFlow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
