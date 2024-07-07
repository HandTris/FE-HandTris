"use client";
import { Github, Volume2, VolumeX } from "lucide-react";
import React from "react";
import { useMusic } from "./MusicProvider";
import { FOOTER_BTN_STYLE } from "@/styles";
import { handleHover, menuClickSound } from "@/hook/howl";

function Footer() {
  const { isMusicPlaying, toggleMusic } = useMusic();

  return (
    <footer className="pixel relative">
      <div className="bg-[#040F2D] py-4 border-b-0 border-2 border-gray-200 rounded-t-sm relative z-10">
        <div className="flex justify-between items-center mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex-grow">
            <p className="text-xl text-gray-200">
              {"WELCOME TO HANDTRIS | All Right Reserved. © 2024"}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute right-6 -bottom-8 flex items-center gap-4">
        <button
          onMouseEnter={handleHover}
          onClick={() => {
            toggleMusic();
            if (!isMusicPlaying) {
              menuClickSound();
            }
          }}
          className={FOOTER_BTN_STYLE}
          aria-label="Toggle music"
        >
          {isMusicPlaying ? (
            <VolumeX className="h-14 w-14" />
          ) : (
            <Volume2 className="h-14 w-14" />
          )}
        </button>
        <button
          onMouseEnter={handleHover}
          onClick={() => {
            window.open("https://github.com/HandTris", "_blank");
            menuClickSound();
          }}
          className={FOOTER_BTN_STYLE}
          aria-label="GitHub repository"
        >
          <Github className="h-14 w-14" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
