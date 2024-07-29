export const showCountdown = (): Promise<void> => {
  return new Promise<void>(resolve => {
    let count = 3;
    const modals: HTMLElement[] = [];

    const createModal = (): HTMLElement => {
      const modal = document.createElement("div");
      modal.classList.add(
        "absolute",
        "top-1/2",
        "left-1/2",
        "transform",
        "-translate-x-1/2",
        "-translate-y-1/2",
        "text-white",
        "text-center",
        "transition-all",
        "duration-700",
      );
      return modal;
    };

    for (let i = 0; i < 4; i++) {
      const modal = createModal();
      modals.push(modal);
      document.querySelector(".modal-container")?.appendChild(modal);
    }

    const updateCountdown = () => {
      const modal = modals[3 - count];
      modal.innerHTML = count > 0 ? count.toString() : "Go!";
      modal.style.opacity = "1";
      modal.style.fontSize = "0rem";

      setTimeout(() => {
        modal.style.opacity = "0";
        modal.style.fontSize = "40rem";
      }, 100);
    };

    const countdownInterval = setInterval(() => {
      updateCountdown();
      count--;
      if (count < 0) {
        clearInterval(countdownInterval);
        setTimeout(() => {
          modals.forEach(modal =>
            document.querySelector(".modal-container")?.removeChild(modal),
          );
          resolve();
        }, 1000);
      }
    }, 1000);
  });
};
