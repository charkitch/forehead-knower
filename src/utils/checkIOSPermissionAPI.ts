export const checkIOSPermissionAPI = (
  windowObj: Window = window,
  deviceOrientationEvent:
    | typeof DeviceOrientationEvent
    | undefined = window.DeviceOrientationEvent,
): boolean => {
  if (typeof windowObj === "undefined" || !deviceOrientationEvent) {
    return false;
  }

  try {
    // @ts-expect-error - We intentionally ignore the type here and handle it at runtime
    return typeof deviceOrientationEvent.requestPermission === "function";
  } catch {
    return false;
  }
};
