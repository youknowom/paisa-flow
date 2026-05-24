"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { springPress } from "@/lib/motion-presets";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={springPress}
            className="relative w-full max-w-md rounded-xl bg-surface-3 border border-border-subtle p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  variant === "danger" ? "bg-red/15" : "bg-accent/15"
                }`}
              >
                <AlertTriangle
                  size={24}
                  className={variant === "danger" ? "text-red" : "text-accent"}
                />
              </div>
              <h3 className="text-h3 font-semibold text-text-primary font-heading">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-text-muted mt-2">{description}</p>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <Button
                variant="ghost"
                fullWidth
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                fullWidth
                loading={loading}
                onClick={onConfirm}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
