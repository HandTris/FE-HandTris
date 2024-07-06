import { Howl } from "howler";

export const backgroundMusic = new Howl({
  src: ["/sound/themeA.ogg"],
  loop: true,
  volume: 0.6,
});

export const themeMusic = new Howl({
  src: ["/sound/ThemeMusic3.mp3"],
  loop: true,
  volume: 0.5,
});

export function menuHoverSound() {
  const soundEffect = new Howl({ src: ["/sound/HoverSound.mp3"], volume: 0.3 });
  soundEffect.play();
}
export function menuClickSound() {
  const soundEffect = new Howl({ src: ["/sound/Click_.mp3"], volume: 1.0 });
  themeMusic.fade(0.5, 0.2, 1000);
  soundEffect.play();
}

export function playSoundEffect(soundUrl: string) {
  const soundEffect = new Howl({ src: [soundUrl] });

  soundEffect.on("play", () => {
    backgroundMusic.fade(0.6, 0.2, 1000);
  });

  soundEffect.on("end", () => {
    backgroundMusic.fade(0.2, 0.6, 1000);
  });

  soundEffect.play();
}
