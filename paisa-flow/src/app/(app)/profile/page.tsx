"use client";

import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { CURRENCIES, PAYMENT_MODES } from "@/lib/constants";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet, Sparkles, CreditCard, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  currency: z.string(),
  monthlyBudget: z.number().min(0, "Budget must be a positive number").optional(),
  defaultPaymentMode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const paymentIcons: Record<string, ReactNode> = {
  upi: <Sparkles size={18} />,
  cash: <Wallet size={18} />,
  card: <CreditCard size={18} />,
  other: <MoreHorizontal size={18} />,
};

export default function ProfilePage() {
  const { user, isLoading } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: user
      ? {
          name: user.name,
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
          defaultPaymentMode: user.defaultPaymentMode ?? "upi",
        }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        name: data.name,
        currency: data.currency,
        monthlyBudget: data.monthlyBudget,
        defaultPaymentMode: data.defaultPaymentMode,
      });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="page-title mb-1">Profile</h1>
      <p className="text-[14px] text-text-muted mb-6">
        Your name, currency, and defaults
      </p>

      <div className="card-surface p-5 mb-5 flex items-center gap-4">
        <Avatar name={user.name} imageUrl={user.imageUrl} size="lg" />
        <div className="min-w-0">
          <p className="text-[16px] font-bold text-text-primary font-heading truncate">
            {user.name}
          </p>
          <p className="text-[13px] text-text-muted truncate">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-5">
        <div className="form-group">
          <label className="form-label">Display name</label>
          <input
            type="text"
            autoComplete="name"
            {...register("name")}
            className="input-field"
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Base currency</label>
          <select {...register("currency")} className="input-field">
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.symbol} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Monthly budget (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono-amount text-[15px]">
              ₹
            </span>
            <input
              type="number"
              {...register("monthlyBudget", { valueAsNumber: true })}
              placeholder="e.g. 30000"
              className="input-field pl-9"
            />
          </div>
          {errors.monthlyBudget && (
            <p className="form-error">{errors.monthlyBudget.message}</p>
          )}
        </div>

        <div className="form-group mb-6">
          <label className="form-label">Default payment mode</label>
          <Controller
            control={control}
            name="defaultPaymentMode"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_MODES.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => field.onChange(pm.value)}
                    className={cn(
                      "payment-tile",
                      field.value === pm.value && "selected"
                    )}
                  >
                    {paymentIcons[pm.value]}
                    {pm.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
