import { renderHook, act } from "@testing-library/react";
import { useMotionControls } from "@/utils/useMotionControls";
import { setupTests } from "./setup";

describe("useMotionControls - Initial State & Permissions", () => {
  setupTests();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
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

  it("should handle non-iOS devices", async () => {
    // Create mock constructor without requestPermission
    const MockDeviceOrientationEvent = Object.assign(
      function (type: string) {
        return new Event(type) as DeviceOrientationEvent;
      },
      {
        prototype: Object.create(Event.prototype),
      },
    );

    MockDeviceOrientationEvent.prototype.constructor =
      MockDeviceOrientationEvent;

    const { result } = renderHook(() =>
      useMotionControls({
        deviceOrientationEvent:
          MockDeviceOrientationEvent as unknown as typeof window.DeviceOrientationEvent,
      }),
    );

    await act(async () => {
      await result.current.requestMotionPermission();
    });

    expect(result.current.isMotionEnabled).toBe(true);
  });
});
