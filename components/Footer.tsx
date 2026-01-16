"use client";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className=" py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container mx-auto px-2 md:px-10">
        <div className="flex flex-col md:flex-row justify-center text-center gap-2 md:gap-10 border-t-[1px] border-cool-green mt-10 pt-5">
          <p>
            &copy; {new Date().getFullYear()} _________. Sva prava zadržana.
          </p>
          <a href="https://www.manikamwebsolutions.com/" target="_blank">
            izrada sajta:{" "}
            <span className="font-bold text-primary"> ManikamWebSolutions</span>
          </a>{" "}
        </div>
      </div>
    </motion.footer>
  );
}
