import { useState, useEffect, useRef } from "react";

interface MotionControlsConfig {
  onFlipUp?: () => void;
  onFlipDown?: () => void;
  neutralThreshold?: number;
  actionThreshold?: number;
  enabled?: boolean;
}

type Position = "up" | "neutral" | "down";

// Helper function to safely check for iOS permission API
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

  // Check if device orientation is available
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
        // For non-iOS devices, just enable
        setIsMotionEnabled(true);
        calibrateOrientation();
      }
    } catch (error) {
      console.error("Error requesting motion permission:", error);
    }
  };

  const calibrateOrientation = () => {
    const handler = (event: DeviceOrientationEvent) => {
      setCalibrationBeta(event.beta || 0);
      setCurrentPosition("neutral");
      isProcessingAction.current = false;
      window.removeEventListener("deviceorientation", handler);
    };
    window.addEventListener("deviceorientation", handler);
  };

  useEffect(() => {
    if (!isMotionEnabled || !enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const betaDiff = beta - calibrationBeta;

      setLastBeta(beta);

      // Don't process if we're in the middle of an action
      if (isProcessingAction.current) {
        return;
      }

      // Determine new position
      let newPosition: Position = "neutral";
      if (Math.abs(betaDiff) > actionThreshold) {
        newPosition = betaDiff > 0 ? "up" : "down";
      } else if (Math.abs(betaDiff) <= neutralThreshold) {
        newPosition = "neutral";
      }

      // Only update if position changed
      if (newPosition !== currentPosition) {
        setCurrentPosition(newPosition);

        // If we moved to up or down, trigger action
        if (newPosition === "up" || newPosition === "down") {
          const now = Date.now();
          // Ensure at least 500ms between actions
          if (now - lastActionTime.current > 500) {
            isProcessingAction.current = true;
            lastActionTime.current = now;

            if (newPosition === "up") {
              onFlipUp?.();
            } else {
              onFlipDown?.();
            }

            // Reset after 2 seconds
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
