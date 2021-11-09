import { useRef, useEffect } from "react";

// https://css-tricks.com/using-requestanimationframe-with-react-hooks/

export const useAnimationFrame = (callback, fpsCap = 30, deps = []) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const interval = 1000 / fpsCap;

  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      if (deltaTime > interval) {
        callback(deltaTime);
        previousTimeRef.current = time;
      }
    } else {
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    console.log("Starting to request frame");
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once
};
