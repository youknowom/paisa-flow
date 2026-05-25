export const springPress = {
  type: "spring" as const,
  stiffness: 700,
  damping: 25,
};

export const springSmooth = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const tapScale = {
  whileTap: { scale: 0.94 },
  transition: springPress,
};

export const cardTapScale = {
  whileTap: { scale: 0.96 },
  transition: springPress,
};

export const navTapScale = {
  whileTap: { scale: 0.92 },
  transition: springPress,
};
