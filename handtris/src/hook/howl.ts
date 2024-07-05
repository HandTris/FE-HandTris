import { Howl } from "howler";

export const backgroundMusic = new Howl({
  src: ["/sound/themeA.ogg"],
  loop: true,
  volume: 0.6,
});

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
