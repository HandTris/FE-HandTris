"use client";
import { Github, Volume2 } from "lucide-react";
import React from "react";
import { useMusic } from "./MusicProvider";
import { FOOTER_BTN_STYLE } from "@/styles";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function Footer() {
  const {
    setThemeVolume,
    setBackgroundVolume,
    setEffectsVolume,
    themeVolume,
    backgroundVolume,
    effectsVolume,
    menuHoverSound,
    menuClickSound,
  } = useMusic();

  return (
    <footer className="pixel relative">
      <div className="bg-[#040F2D] py-4 border-b-0 border-2 border-gray-200 relative z-10">
        <div className="flex justify-between items-center mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex-grow">
            <p className="text-xl text-gray-200">
              {"WELCOME TO HANDTRIS | All Right Reserved. © 2024"}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute right-6 -bottom-8 flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button
              onMouseEnter={menuHoverSound}
              onClick={menuClickSound}
              className={FOOTER_BTN_STYLE}
              aria-label="Adjust volume"
            >
              <Volume2 className="h-14 w-14" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#0A1940] border-2 border-green-400 shadow-md shadow-green-400/30">
            <div className="grid gap-6 p-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-green-400">
                  Theme Music
                </h4>
                <Slider
                  value={[themeVolume]}
                  max={1}
                  step={0.1}
                  onValueChange={value => setThemeVolume(value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-green-400">
                  InGame Music
                </h4>
                <Slider
                  value={[backgroundVolume]}
                  max={1}
                  step={0.1}
                  onValueChange={value => setBackgroundVolume(value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-green-400">
                  Global Sound
                </h4>
                <Slider
                  value={[effectsVolume]}
                  max={1}
                  step={0.1}
                  onValueChange={value => setEffectsVolume(value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          onMouseEnter={menuHoverSound}
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
