"use client";

import hero from "../public/hero.jpg";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative flex min-h-[100dvh]">
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-[1]" />
      <Image
        src={hero}
        alt="slep puric"
        fill
        className="w-full h-[100dvh] object-cover"
      />

      <div className="relative container px-2 md:px-4 mx-auto  flex flex-col gap-6 items-center justify-center z-[1] ">
        <h1 className="text-primary md:text-7xl text-xl font-bold px-4">
          Šlep služba Čačak
        </h1>
        <h2 className="text-muted font-medium md:text-5xl text-md">
          Od 0 do 24h, sedam dana u nedelji!
        </h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <Link href="/proizvodi">
            <motion.button
              whileHover={{ translateY: "-5px" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary text-muted px-4 py-2 md:px-8 md:py-3 rounded-lg font-medium"
            >
              Istražite naše proizvode
              <ArrowRightIcon className="w-[18px]" />
            </motion.button>
          </Link>
          <a href="tel:+3816000000">
            <motion.button
              whileHover={{ translateY: "-5px" }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent text-muted border-muted border-[1px] rounded-lg px-4 md:px-8 md:py-3 py-2 font-medium"
            >
              Pozovite odmah
            </motion.button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
