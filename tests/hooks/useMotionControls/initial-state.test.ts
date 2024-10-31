import { renderHook, act } from "@testing-library/react";
import { useMotionControls } from "@/utils/useMotionControls";
import { setupTests } from "./setup";

describe("useMotionControls - Initial State & Permissions", () => {
  setupTests();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMotionControls({}));

    expect(result.current).toEqual({
      isMotionEnabled: false,
      requestMotionPermission: expect.any(Function),
      calibrateOrientation: expect.any(Function),
      currentPosition: "neutral",
      lastBeta: 0,
      smoothedBeta: 0,
    });
  });

  it("should handle iOS permission request", async () => {
    const mockRequestPermission = jest.fn().mockResolvedValue("granted");

    (window.DeviceOrientationEvent as EventListener) = {
      requestPermission: mockRequestPermission,
    };

    const { result } = renderHook(() => useMotionControls({}));

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(result.current.isMotionEnabled).toBe(true);
  });

  it("should handle non-iOS devices", async () => {
    (window.DeviceOrientationEvent as EventListener) = {};

    const { result } = renderHook(() => useMotionControls({}));

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(result.current.isMotionEnabled).toBe(true);
  });

  it("should handle permission denial", async () => {
    const mockRequestPermission = jest.fn().mockResolvedValue("denied");

    (window.DeviceOrientationEvent as EventListener) = {
      requestPermission: mockRequestPermission,
    };

    const { result } = renderHook(() => useMotionControls({}));

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(result.current.isMotionEnabled).toBe(false);
  });
});
