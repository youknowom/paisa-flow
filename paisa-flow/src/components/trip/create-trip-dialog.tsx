"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { tripSchema, type TripInput } from "@/lib/validations";
import { CURRENCIES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateTripDialogProps {
  open: boolean;
  onClose: () => void;
}

const TRIP_EMOJIS = [
  "🏖️", "🏔️", "🌍", "✈️", "🚗", "🏕️",
  "🎉", "🛳️", "🎿", "🏝️", "🌆", "🎭",
];

export function CreateTripDialog({ open, onClose }: CreateTripDialogProps) {
  const createTrip = useMutation(api.trips.createTrip);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripInput>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      location: "",
      startDate: "",
      endDate: "",
      currency: "INR",
      coverEmoji: "🏖️",
    },
  });

  const selectedEmoji = watch("coverEmoji");

  const onSubmit = async (data: TripInput) => {
    try {
      await createTrip(data);
      toast.success(`Trip "${data.name}" created!`);
      reset();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create trip"
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="modal-sheet w-full md:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle md:hidden" />
            <div className="modal-header">
              <h2 className="modal-title">Create New Trip</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-text-muted"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="modal-body space-y-0"
            >
              <div className="form-group">
                <label className="form-label">Trip emoji</label>
                <div className="flex flex-wrap gap-2">
                  {TRIP_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setValue("coverEmoji", emoji)}
                      className={cn(
                        "emoji-picker-btn",
                        selectedEmoji === emoji && "selected"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Trip name</label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("name")}
                  placeholder="e.g. Goa with friends"
                  className="input-field"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("location")}
                  placeholder="e.g. Goa, India"
                  className="input-field"
                />
                {errors.location && (
                  <p className="form-error">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 form-group">
                <div>
                  <label className="form-label">Start date</label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="input-field"
                  />
                  {errors.startDate && (
                    <p className="form-error">{errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">End date</label>
                  <input
                    type="date"
                    {...register("endDate")}
                    className="input-field"
                  />
                  {errors.endDate && (
                    <p className="form-error">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select {...register("currency")} className="input-field">
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.symbol} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2"
              >
                {isSubmitting ? "Creating..." : "Create Trip"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
