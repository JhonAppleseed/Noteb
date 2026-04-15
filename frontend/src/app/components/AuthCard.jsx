import { motion } from "motion/react";

export function AuthCard({ children }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-12 text-center">
          <h1 className="text-3xl tracking-tight">Noteb</h1>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
