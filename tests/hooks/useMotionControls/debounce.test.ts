import { renderHook, act } from "@testing-library/react";
import { useMotionControls } from "@/utils/useMotionControls";
import { setupTests, MockDeviceOrientationEvent } from "./setup";

describe("useMotionControls - Debouncing & Smoothing", () => {
  setupTests();
  let mockNow = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    mockNow = 0;
    jest.spyOn(Date, "now").mockImplementation(() => mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const createEventHandlerTracker = () => {
    type DeviceOrientationHandler = (event: DeviceOrientationEvent) => void;
    const handlers = new Set<DeviceOrientationHandler>();

    window.addEventListener = jest.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === "deviceorientation") {
          handlers.add(listener as DeviceOrientationHandler);
        }
      },
    ) as typeof window.addEventListener;

    window.removeEventListener = jest.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === "deviceorientation") {
          handlers.delete(listener as DeviceOrientationHandler);
        }
      },
    ) as typeof window.removeEventListener;

    return handlers;
  };

  it("should debounce multiple quick motions", async () => {
    const handlers = createEventHandlerTracker();
    const onFlipUp = jest.fn();
    const { result } = renderHook(() =>
      useMotionControls({
        onFlipUp,
        neutralThreshold: 15,
        actionThreshold: 45,
        enabled: true,
      }),
    );

    // Initialize motion permission and wait for setup
    await act(async () => {
      await result.current.requestMotionPermission();
      await Promise.resolve();
    });

    // Initialize at neutral position with multiple readings to fill smoothing buffer
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(0)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    // Verify we're in neutral position
    expect(result.current.currentPosition).toBe("neutral");
    expect(result.current.smoothedBeta).toBe(0);

    // Move through intermediate positions to simulate realistic motion
    await act(async () => {
      const positions = [30, 45, 60, 75, 90];
      mockNow = 1000;

      for (const pos of positions) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(pos)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    // Verify action was triggered
    expect(result.current.currentPosition).toBe("up");

    // Return to neutral gradually
    await act(async () => {
      mockNow = 2000;
      const positions = [60, 30, 15, 0];

      for (const pos of positions) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(pos)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    expect(result.current.currentPosition).toBe("neutral");

    // Try second motion after debounce period
    await act(async () => {
      mockNow = 3000;
      const positions = [30, 45, 60, 75, 90];

      for (const pos of positions) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(pos)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    expect(onFlipUp).toHaveBeenCalledTimes(1);
  });

  it("should smooth beta values", async () => {
    const handlers = createEventHandlerTracker();
    const { result } = renderHook(() =>
      useMotionControls({
        enabled: true,
      }),
    );

    await act(async () => {
      await result.current.requestMotionPermission();
      await Promise.resolve();
    });

    await act(async () => {
      handlers.forEach((handler) => handler(new MockDeviceOrientationEvent(0)));
      await Promise.resolve();
    });

    await act(async () => {
      const values = [48, 49, 51, 50, 52];
      for (const beta of values) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(beta)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    expect(result.current.smoothedBeta).toBeCloseTo(50, 0);
    expect(result.current.lastBeta).toBe(52);
  });

  it("should properly initialize smoothing buffer", async () => {
    const handlers = createEventHandlerTracker();
    const { result } = renderHook(() =>
      useMotionControls({
        enabled: true,
      }),
    );

    await act(async () => {
      await result.current.requestMotionPermission();
      await Promise.resolve();
    });

    await act(async () => {
      const values = [1, 2, 3, 4, 5];
      for (const beta of values) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(beta)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
      }
    });

    expect(result.current.smoothedBeta).toBe(3);
  });
});
