export const checkIOSPermissionAPI = () => {
  if (typeof window === "undefined" || !window.DeviceOrientationEvent) {
    return false;
  }

  try {
    // @ts-expect-error - We intentionally ignore the type here and handle it at runtime
    return typeof DeviceOrientationEvent.requestPermission === "function";
  } catch {
    return false;
  }
};
