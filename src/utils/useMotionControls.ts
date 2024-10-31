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
  const [smoothedBeta, setSmoothedBeta] = useState(0);
  const isProcessingAction = useRef(false);
  const lastActionTime = useRef(0);
  const betaValues = useRef<number[]>([]);
  const isCalibrated = useRef(false);

  const smoothBeta = (newBeta: number): number => {
    const values = betaValues.current;
    values.push(newBeta);

    if (values.length > 5) {
      values.shift();
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    setSmoothedBeta(average);
    return average;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requiresPermission = checkIOSPermissionAPI();
    if (!requiresPermission) {
      setIsMotionEnabled(true);
    }
  }, []);

  const calibrateOrientation = () => {
    // Reset state
    betaValues.current = [];
    isProcessingAction.current = false;
    isCalibrated.current = false;
    lastActionTime.current = 0;

    const handler = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      setCalibrationBeta(beta);
      smoothBeta(beta); // Initialize smoothing buffer
      setCurrentPosition("neutral");
      isCalibrated.current = true;
      window.removeEventListener("deviceorientation", handler);
    };

    window.addEventListener("deviceorientation", handler);
  };

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

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      setLastBeta(beta);

      if (!isCalibrated.current) {
        return;
      }

      const smoothedValue = smoothBeta(beta);
      const betaDiff = smoothedValue - calibrationBeta;

      if (isProcessingAction.current) {
        return;
      }

      let newPosition: Position = currentPosition;
      if (Math.abs(betaDiff) > actionThreshold) {
        newPosition = betaDiff > 0 ? "up" : "down";
      } else if (Math.abs(betaDiff) <= neutralThreshold) {
        newPosition = "neutral";
      }

      if (newPosition !== currentPosition) {
        setCurrentPosition(newPosition);

        if (newPosition === "up" || newPosition === "down") {
          const now = Date.now();
          if (now - lastActionTime.current > 500) {
            isProcessingAction.current = true;
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
    smoothedBeta,
  };
};
