import { Dispatch, SetStateAction, MutableRefObject } from "react";

type Position = "up" | "neutral" | "down";

interface HandleOrientationParams {
  event: DeviceOrientationEvent;
  setLastBeta: Dispatch<SetStateAction<number>>;
  smoothBeta: (beta: number) => number;
  calibrationBeta: number;
  neutralThreshold: number;
  actionThreshold: number;
  currentPosition: Position;
  setCurrentPosition: Dispatch<SetStateAction<Position>>;
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  isProcessingAction: MutableRefObject<boolean>;
  lastActionTime: MutableRefObject<number>;
  hasReturnedToNeutral: MutableRefObject<boolean>;
}

export const handleOrientation = ({
  event,
  setLastBeta,
  smoothBeta,
  calibrationBeta,
  neutralThreshold,
  actionThreshold,
  currentPosition,
  setCurrentPosition,
  onFlipUp,
  onFlipDown,
  isProcessingAction,
  lastActionTime,
  hasReturnedToNeutral,
}: HandleOrientationParams) => {
  const beta = event.beta || 0;
  setLastBeta(beta);

  const smoothedValue = smoothBeta(beta);
  const betaDiff = smoothedValue - calibrationBeta;
  const absBetaDiff = Math.abs(betaDiff);

  // First handle neutral position detection
  if (absBetaDiff <= neutralThreshold) {
    if (currentPosition !== "neutral") {
      setCurrentPosition("neutral");
      hasReturnedToNeutral.current = true;
      // Only reset processing state if we've truly returned to neutral
      if (isProcessingAction.current) {
        setTimeout(() => {
          isProcessingAction.current = false;
        }, 500); // Shorter cooldown when returning to neutral
      }
    }
    return;
  }

  // Handle transitions between positions
  let newPosition: Position = currentPosition;

  if (absBetaDiff > actionThreshold) {
    newPosition = betaDiff > 0 ? "up" : "down";

    if (hasReturnedToNeutral.current && !isProcessingAction.current) {
      const now = Date.now();
      if (now - lastActionTime.current >= 1000) {
        isProcessingAction.current = true;
        hasReturnedToNeutral.current = false;
        lastActionTime.current = now;

        if (newPosition === "up") {
          onFlipUp?.();
        } else {
          onFlipDown?.();
        }
      }
    }
  } else if (currentPosition !== "neutral") {
    // When between neutral and action thresholds, return to neutral
    newPosition = "neutral";
    hasReturnedToNeutral.current = true;
  }

  if (newPosition !== currentPosition) {
    setCurrentPosition(newPosition);
  }
};
