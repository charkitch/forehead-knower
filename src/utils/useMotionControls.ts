// utils/useMotionControls.ts
import { useState, useEffect } from "react";

interface MotionControlsConfig {
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
}

declare global {
  interface Window {
    DeviceOrientationEvent: DeviceOrientationEventStatic;
  }
}

export const useMotionControls = ({
  onFlipUp,
  onFlipDown,
  threshold = 45,
  enabled = false,
}: MotionControlsConfig) => {
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const [lastBeta, setLastBeta] = useState(0);
  const [calibrationBeta, setCalibrationBeta] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      if (
        typeof window.DeviceOrientationEvent.requestPermission === "function"
      ) {
        setIsMotionEnabled(false);
      } else {
        setIsMotionEnabled(true);
      }
    }
  }, []);

  const requestMotionPermission = async () => {
    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission =
          await window.DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setIsMotionEnabled(true);
        }
      } catch (error) {
        console.error("Error requesting motion permission:", error);
      }
    }
  };

  const calibrateOrientation = () => {
    window.addEventListener(
      "deviceorientation",
      function handler(event: DeviceOrientationEvent) {
        setCalibrationBeta(event.beta || 0);
        window.removeEventListener("deviceorientation", handler);
      },
    );
  };

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      setLastBeta(beta);

      // Calculate the difference from calibration position
      const betaDiff = beta - calibrationBeta;

      if (Math.abs(betaDiff) > threshold) {
        // Flip up (positive beta difference)
        if (betaDiff > threshold) {
          onFlipUp?.();
        }
        // Flip down (negative beta difference)
        else if (betaDiff < -threshold) {
          onFlipDown?.();
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    calibrateOrientation();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [
    isMotionEnabled,
    enabled,
    calibrationBeta,
    threshold,
    onFlipUp,
    onFlipDown,
  ]);

  return {
    isMotionEnabled,
    requestMotionPermission,
    calibrateOrientation,
    lastBeta,
  };
};
