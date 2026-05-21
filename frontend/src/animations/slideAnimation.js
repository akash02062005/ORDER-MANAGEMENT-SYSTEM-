export const slideIn = {
  initial: { x: -30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 },
  transition: { duration: 0.4 }
};

export const slideUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -30, opacity: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};
