"use client";
import React, { useEffect, useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

const ButtonToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const isBrowser = () => typeof window !== "undefined";
  const scrollToTop = () => {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      className={` scrollToTopButton ${
        isVisible ? "visible" : ""
      }  fixed bottom-0 right-0 p-1 mr-6 mb-[71px] bg-primary rounded-full z-50 font-bold `}
      onClick={scrollToTop}
    >
      <IoIosArrowUp className=" text-[35px] text-white" />
    </button>
  );
};

export default ButtonToTop;
