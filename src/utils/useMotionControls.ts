import { useState, useEffect, useRef } from "react";
import { calculateSmoothedBeta } from "@/utils/calculateSmoothBeta";
import { checkIOSPermissionAPI } from "@/utils/checkIOSPermissionAPI";
import { handleOrientation } from "@/utils/handleOrientation";

interface MotionControlsConfig {
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  neutralThreshold?: number;
  actionThreshold?: number;
  enabled?: boolean;
  deviceOrientationEvent?: Partial<typeof window.DeviceOrientationEvent>;
}

type Position = "up" | "neutral" | "down";

export const useMotionControls = ({
  onFlipUp,
  onFlipDown,
  neutralThreshold = 15,
  actionThreshold = 45,
  enabled = false,
  deviceOrientationEvent = window.DeviceOrientationEvent, // pass in so we can mock in tests
}: MotionControlsConfig) => {
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const [calibrationBeta, setCalibrationBeta] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<Position>("neutral");
  const [lastBeta, setLastBeta] = useState(0);
  const [smoothedBeta, setSmoothedBeta] = useState(0);

  const isProcessingAction = useRef(false);
  const lastActionTime = useRef(0);
  const hasReturnedToNeutral = useRef(true);
  const betaValues = useRef<number[]>([]);

  const requestMotionPermission = async () => {
    try {
      if (checkIOSPermissionAPI()) {
        // @ts-expect-error - We intentionally ignore the type here and handle it at runtime
        const permission = await deviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setIsMotionEnabled(true);
          calibrateOrientation();
        }
      } else if (deviceOrientationEvent) {
        setIsMotionEnabled(true);
        calibrateOrientation();
      }
    } catch (error) {
      console.error("Error requesting motion permission:", error);
    }
  };

  const calibrateOrientation = () => {
    betaValues.current = [];
    isProcessingAction.current = false;
    hasReturnedToNeutral.current = true;
    lastActionTime.current = 0;

    const handler = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      setCalibrationBeta(beta);
      smoothBeta(beta);
      setCurrentPosition("neutral");
      window.removeEventListener("deviceorientation", handler);
    };

    window.addEventListener("deviceorientation", handler);
  };

  const smoothBeta = (newBeta: number): number => {
    const values = betaValues.current;
    values.push(newBeta);

    if (values.length > 5) {
      values.shift();
    }

    const average = calculateSmoothedBeta(values);
    setSmoothedBeta(average);
    return average;
  };

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientationWrapper = (event: DeviceOrientationEvent) => {
      handleOrientation({
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
      });
    };

    window.addEventListener("deviceorientation", handleOrientationWrapper);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientationWrapper);
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
