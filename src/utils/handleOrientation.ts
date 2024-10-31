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

  if (isProcessingAction.current) {
    return;
  }

  let newPosition: Position = "neutral";
  if (Math.abs(betaDiff) <= neutralThreshold) {
    newPosition = "neutral";
    hasReturnedToNeutral.current = true;
  } else if (Math.abs(betaDiff) > actionThreshold) {
    newPosition = betaDiff > 0 ? "up" : "down";
  }

  if (newPosition !== currentPosition) {
    setCurrentPosition(newPosition);

    if (
      hasReturnedToNeutral.current &&
      (newPosition === "up" || newPosition === "down")
    ) {
      const now = Date.now();
      if (now - lastActionTime.current > 1000) {
        isProcessingAction.current = true;
        hasReturnedToNeutral.current = false;
        lastActionTime.current = now;

        if (newPosition === "up") {
          onFlipUp?.();
        } else {
          onFlipDown?.();
        }

        setTimeout(() => {
          isProcessingAction.current = false;
        }, 2000);
      }
    }
  }
};
