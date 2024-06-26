export const playBackgroundMusic = () => {
    const audio = new Audio("/sounds/tetris.mp3");
    audio.loop = true;

    audio
        .play()
        .then(() => {
            console.log("Background music started playing");
        })
        .catch((error) => {
            console.error("Error playing audio:", error);
        });

    return audio;
};

export const stopBackgroundMusic = (audio: HTMLAudioElement) => {
    audio.pause();
    console.log("Background music stopped");
};
