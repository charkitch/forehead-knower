import { renderHook, act } from "@testing-library/react";
import { useMotionControls } from "@/utils/useMotionControls";
import { setupTests } from "./setup";

describe("useMotionControls - Initial State & Permissions", () => {
  setupTests();

  it("should initialize with default values", () => {
    // Test with no DeviceOrientationEvent by passing undefined
    const { result } = renderHook(() =>
      useMotionControls({ deviceOrientationEvent: undefined }),
    );

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

    // Pass in a mock deviceOrientationEvent with requestPermission
    const mockDeviceOrientationEvent = {
      requestPermission: mockRequestPermission,
    };

    const { result } = renderHook(() =>
      useMotionControls({ deviceOrientationEvent: mockDeviceOrientationEvent }),
    );

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(result.current.isMotionEnabled).toBe(true);
  });

  it("should handle non-iOS devices", async () => {
    // Pass in a mock deviceOrientationEvent without requestPermission
    const mockDeviceOrientationEvent = function () {};

    const { result } = renderHook(() =>
      useMotionControls({ deviceOrientationEvent: mockDeviceOrientationEvent }),
    );

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(result.current.isMotionEnabled).toBe(true);
  });
});
