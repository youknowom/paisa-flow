export const springPress = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const springSmooth = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: springPress,
};

export const cardTapScale = {
  whileTap: { scale: 0.99 },
  transition: springPress,
};

export const navTapScale = {
  whileTap: { scale: 0.95 },
  transition: springPress,
};
