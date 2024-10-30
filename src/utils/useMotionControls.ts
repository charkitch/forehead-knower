import { useState, useEffect, useRef } from "react";

interface MotionControlsConfig {
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  threshold?: number;
  enabled?: boolean;
  cooldownPeriod?: number;
}

interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
}

declare global {
  interface Window {
    DeviceOrientationEvent: DeviceOrientationEventStatic;
  }
}

type FlipState = "neutral" | "up" | "down";

export const useMotionControls = ({
  onFlipUp,
  onFlipDown,
  threshold = 45,
  enabled = false,
  cooldownPeriod = 2000, // 2 seconds cooldown between actions
}: MotionControlsConfig) => {
  const [isMotionEnabled, setIsMotionEnabled] = useState(false);
  const [calibrationBeta, setCalibrationBeta] = useState(0);
  const [lastBeta, setLastBeta] = useState(0);
  const [flipState, setFlipState] = useState<FlipState>("neutral");
  const lastActionTime = useRef<number>(0);
  const isCooldownActive = useRef(false);

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
        setFlipState("neutral");
        isCooldownActive.current = false;
        window.removeEventListener("deviceorientation", handler);
      },
    );
  };

  const startCooldown = () => {
    isCooldownActive.current = true;
    lastActionTime.current = Date.now();

    setTimeout(() => {
      isCooldownActive.current = false;
      setFlipState("neutral");
    }, cooldownPeriod);
  };

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      setLastBeta(beta);

      if (isCooldownActive.current) {
        return;
      }

      // Calculate the difference from calibration position
      const betaDiff = beta - calibrationBeta;

      // Only trigger if we're in neutral state or moving to a different state
      if (Math.abs(betaDiff) > threshold) {
        const newState: FlipState = betaDiff > threshold ? "up" : "down";

        // Only trigger if we're moving to a different state
        if (newState !== flipState) {
          setFlipState(newState);

          if (newState === "up") {
            onFlipUp?.();
          } else if (newState === "down") {
            onFlipDown?.();
          }

          startCooldown();
        }
      } else if (Math.abs(betaDiff) < threshold / 2) {
        // Reset to neutral when close to calibration position
        setFlipState("neutral");
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

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
    flipState,
  ]);

  return {
    isMotionEnabled,
    requestMotionPermission,
    calibrateOrientation,
    lastBeta,
    flipState,
  };
};
