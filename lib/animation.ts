import { 
  animate, 
  spring, 
  timeline, 
  stagger, 
  inView, 
  scroll, 
  type AnimationOptionsWithValueOverrides,
  type Spring
} from 'motion';

// Animation presets
export const springTransition = {
  stiffness: 200,
  damping: 20,
  mass: 1,
  restDelta: 0.001
};

export const smoothTransition: AnimationOptionsWithValueOverrides = {
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1] // Material Design standard easing
};

export const quickTransition: AnimationOptionsWithValueOverrides = {
  duration: 0.2,
  ease: [0.4, 0.0, 0.2, 1]
};

// Fade animations
export const fadeIn = (element: HTMLElement, delay: number = 0) => {
  return animate(
    element,
    { opacity: [0, 1], transform: "translateY(0px)" },
    { ...smoothTransition, delay }
  );
};

export const fadeOut = (element: HTMLElement, delay: number = 0) => {
  return animate(
    element,
    { opacity: [1, 0], transform: "translateY(10px)" },
    { ...smoothTransition, delay }
  );
};

// Chat message animations
export const messageFadeIn = (element: HTMLElement, delay: number = 0) => {
  return animate(
    element,
    { 
      opacity: [0, 1],
      transform: "scale(1) translateY(0px)" 
    },
    { ...smoothTransition, delay }
  );
};

// Staggered list animations
export const staggeredFadeIn = (elements: HTMLElement[], delay: number = 0) => {
  return animate(
    elements,
    { 
      opacity: [0, 1], 
      transform: "translateY(0px)"
    },
    { 
      delay: stagger(0.05, { startDelay: delay }),
      ...smoothTransition
    }
  );
};

// Button press effect
export const buttonPress = (element: HTMLElement) => {
  return animate(
    element,
    { transform: "scale(0.97)" },
    { duration: 0.15, ease: "easeInOut" }
  );
};

// Observe element in view and animate
export const animateOnInView = (
  element: HTMLElement, 
  inViewAnimation: (element: HTMLElement) => void
) => {
  return inView(element, () => {
    inViewAnimation(element);
  });
};

// Header appearance animation
export const headerAnimation = (element: HTMLElement) => {
  return animate(
    element, 
    { 
      transform: "translateY(0px)",
      opacity: [0, 1] 
    }, 
    smoothTransition
  );
};

// Notification animation
export const notificationAnimation = {
  enter: (element: HTMLElement) => animate(
    element,
    { 
      opacity: [0, 1],
      transform: "scale(1) translateY(0px)"
    },
    smoothTransition
  ),
  exit: (element: HTMLElement) => animate(
    element,
    { 
      opacity: [1, 0],
      transform: "scale(0.95) translateY(-20px)"
    },
    quickTransition
  )
};

// Modal animations
export const modalAnimation = {
  overlay: {
    enter: (element: HTMLElement) => animate(
      element,
      { opacity: [0, 1] },
      smoothTransition
    ),
    exit: (element: HTMLElement) => animate(
      element,
      { opacity: [1, 0] },
      quickTransition
    )
  },
  content: {
    enter: (element: HTMLElement) => animate(
      element,
      { 
        opacity: [0, 1],
        transform: "scale(1) translateY(0px)"
      },
      smoothTransition
    ),
    exit: (element: HTMLElement) => animate(
      element,
      { 
        opacity: [1, 0],
        transform: "scale(0.95) translateY(10px)"
      },
      quickTransition
    )
  }
}; 