"use client";

import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-800 p-1 transition-colors group"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <div className="relative w-full h-full flex items-center justify-between px-1">
        <Sun className="w-4 h-4 text-amber-500 z-10" />
        <Moon className="w-4 h-4 text-indigo-400 z-10" />
      </div>

      <motion.div
        animate={{
          x: theme === "light" ? 0 : 28,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-slate-100 shadow-sm flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "light" ? (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
            >
              <Sun className="w-3 h-3 text-amber-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, rotate: 45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: -45, opacity: 0 }}
            >
              <Moon className="w-3 h-3 text-indigo-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
