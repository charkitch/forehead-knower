import { useState, useEffect, useRef } from "react";

interface MotionControlsConfig {
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  neutralThreshold?: number;
  actionThreshold?: number;
  enabled?: boolean;
}

type Position = "up" | "neutral" | "down";

const checkIOSPermissionAPI = () => {
  try {
    // @ts-expect-error - We intentionally ignore the type here and handle it at runtime
    return typeof DeviceOrientationEvent.requestPermission === "function";
  } catch {
    return false;
  }
};

export const useMotionControls = ({
  onFlipUp,
  onFlipDown,
  neutralThreshold = 15,
  actionThreshold = 45,
  enabled = false,
}: MotionControlsConfig) => {
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const [calibrationBeta, setCalibrationBeta] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<Position>("neutral");
  const [lastBeta, setLastBeta] = useState(0);

  const isProcessingAction = useRef(false);
  const lastActionTime = useRef(0);
  const hasReturnedToNeutral = useRef(true);
  const betaBuffer = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const requiresPermission = checkIOSPermissionAPI();
    if (!requiresPermission) {
      setIsMotionEnabled(true);
    }
  }, []);

  const requestMotionPermission = async () => {
    try {
      if (checkIOSPermissionAPI()) {
        // @ts-expect-error - We intentionally ignore the type here and handle it at runtime
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setIsMotionEnabled(true);
          calibrateOrientation();
        }
      } else {
        setIsMotionEnabled(true);
        calibrateOrientation();
      }
    } catch (error) {
      console.error("Error requesting motion permission:", error);
    }
  };

  const calibrateOrientation = () => {
    isProcessingAction.current = false;
    hasReturnedToNeutral.current = true;
    betaBuffer.current = [];
    lastActionTime.current = 0;

    const handler = (event: DeviceOrientationEvent) => {
      setCalibrationBeta(event.beta || 0);
      setCurrentPosition("neutral");
      window.removeEventListener("deviceorientation", handler);
    };
    window.addEventListener("deviceorientation", handler);
  };

  const getSmoothedBeta = (newBeta: number) => {
    const BUFFER_SIZE = 5;
    betaBuffer.current.push(newBeta);
    if (betaBuffer.current.length > BUFFER_SIZE) {
      betaBuffer.current.shift();
    }

    return (
      betaBuffer.current.reduce((sum, val) => sum + val, 0) /
      betaBuffer.current.length
    );
  };

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const rawBeta = event.beta || 0;
      const smoothedBeta = getSmoothedBeta(rawBeta);
      const betaDiff = smoothedBeta - calibrationBeta;

      setLastBeta(smoothedBeta);

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

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [
    isMotionEnabled,
    enabled,
    calibrationBeta,
    neutralThreshold,
    actionThreshold,
    onFlipUp,
    onFlipDown,
    currentPosition,
  ]);

  return {
    isMotionEnabled,
    requestMotionPermission,
    calibrateOrientation,
    currentPosition,
    lastBeta,
  };
};
