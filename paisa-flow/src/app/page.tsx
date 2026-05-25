"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Daily Expense Tracking",
    description:
      "Log every rupee with UPI, cash, or card. Get real-time category breakdowns and spending insights.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Smart Trip Splitting",
    description:
      "Split expenses equally, by custom amounts, or percentages. Our debt simplification algorithm minimizes transactions.",
    color: "text-cyan",
    bg: "bg-cyan/10",
  },
  {
    icon: TrendingUp,
    title: "Budget Intelligence",
    description:
      "Set monthly budgets and get proactive alerts at 70%, 90%, and 100% thresholds. Never overspend again.",
    color: "text-violet",
    bg: "bg-violet/10",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description:
      "Weekly trends, category breakdowns, payment mode distribution, and budget vs. actual comparisons.",
    color: "text-amber",
    bg: "bg-amber/10",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description:
      "Powered by Convex — every change syncs instantly across all devices. No refresh needed.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Built for India",
    description:
      "INR-first formatting, UPI payment tracking, lakh/crore number system, and Indian-friendly categories.",
    color: "text-cyan",
    bg: "bg-cyan/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center">
              <span className="text-background font-bold text-sm">₹</span>
            </div>
            <span className="text-xl font-bold gradient-text">PaisaFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link href="/sign-up">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-xl transition-colors"
              >
                Get Started
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            Built for Indian travelers & daily spenders
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight"
          >
            Track Spending.
            <br />
            <span className="gradient-text">Split Trips.</span>
            <br />
            Settle Smarter.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            The premium personal finance app that combines daily expense
            tracking with intelligent group trip splitting. No more awkward
            money conversations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/sign-up">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-background font-semibold rounded-2xl text-lg transition-colors shadow-lg shadow-accent/20"
              >
                Start for Free
                <ArrowRight size={20} />
              </motion.div>
            </Link>
            <Link href="/sign-in">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-card hover:bg-card-hover border border-border text-text-primary font-semibold rounded-2xl text-lg transition-colors"
              >
                I have an account
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              {[
                {
                  label: "This Month",
                  value: "₹24,580",
                  color: "text-text-primary",
                },
                { label: "Today", value: "₹350", color: "text-text-primary" },
                { label: "You're Owed", value: "₹4,200", color: "text-accent" },
                { label: "You Owe", value: "₹1,800", color: "text-red" },
                { label: "Budget Used", value: "68%", color: "text-amber" },
                { label: "Active Trips", value: "2", color: "text-cyan" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card-hover border border-border rounded-2xl p-3 md:p-4"
                >
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p
                    className={`text-sm md:text-lg font-mono font-bold mt-1 ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card-hover border border-border rounded-2xl p-5 h-40 flex items-end gap-2">
                {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                    className="flex-1 bg-accent/30 rounded-t-lg relative"
                  >
                    <div
                      className="absolute bottom-0 w-full bg-accent rounded-t-lg"
                      style={{ height: "60%" }}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="bg-card-hover border border-border rounded-2xl p-5 h-40 flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#27272a"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#22c55e"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      whileInView={{ strokeDashoffset: 251.2 * 0.65 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 1 }}
                      strokeLinecap="round"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#06b6d4"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      whileInView={{ strokeDashoffset: 251.2 * 0.85 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 1 }}
                      strokeLinecap="round"
                      className="opacity-60"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-text-muted">Categories</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need.{" "}
              <span className="gradient-text">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">
              From ₹10 chai to ₹1L trip budgets — PaisaFlow handles it all with
              zero friction.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-border-hover transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={22} className={feature.color} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              From signup to settled in{" "}
              <span className="gradient-text">3 steps</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Sign Up & Set Your Currency",
                desc: "30-second onboarding. Pick your currency, set a budget, and you're in.",
                accent: "border-accent/30",
              },
              {
                step: "02",
                title: "Track or Split",
                desc: "Log daily expenses instantly, or create a trip and invite friends to split costs.",
                accent: "border-cyan/30",
              },
              {
                step: "03",
                title: "Settle Smartly",
                desc: "Our algorithm minimizes the number of payments needed. No more 'who owes who' spreadsheets.",
                accent: "border-violet/30",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card border ${s.accent} rounded-2xl p-6 flex items-start gap-5`}
              >
                <span className="text-3xl font-bold font-mono text-text-muted/30">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {s.title}
                  </h3>
                  <p className="text-text-secondary mt-1">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet/5 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to take control of{" "}
              <span className="gradient-text">your money?</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Join thousands of Indians who manage their daily expenses and trip
              splits with PaisaFlow.
            </p>
            <Link href="/sign-up">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-background font-semibold rounded-2xl text-lg transition-colors shadow-lg shadow-accent/20"
              >
                Get Started — It&apos;s Free
                <ArrowRight size={20} />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-green flex items-center justify-center">
              <span className="text-background font-bold text-xs">₹</span>
            </div>
            <span className="font-semibold gradient-text">PaisaFlow</span>
          </div>
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} PaisaFlow. Built with ❤️ for India.
          </p>
        </div>
      </footer>
    </div>
  );
}
