export const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch((error) => {
        console.error("Error playing audio:", error);
    });
};



