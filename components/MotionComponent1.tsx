"use client";

import React from "react";
import { motion } from "framer-motion";

const MotionComponent1 = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      whileInView={{ y: [100, 50, 0], opacity: [0, 0.5, 1] }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{ scale: 0.95 }}
      className="rounded-xl shadow-2xl shadow-muted-foreground"
    >
      {children}
    </motion.div>
  );
};

export default MotionComponent1;
