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
    const handlers = new Set<(event: Event) => void>();

    window.addEventListener = jest.fn(
      (event: string, handler: EventListener) => {
        if (event === "deviceorientation") {
          handlers.add(handler);
        }
      },
    );

    window.removeEventListener = jest.fn(
      (event: string, handler: EventListener) => {
        if (event === "deviceorientation") {
          handlers.delete(handler);
        }
      },
    );

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

    await act(async () => {
      await result.current.requestMotionPermission();
      await Promise.resolve();
    });

    await act(async () => {
      handlers.forEach((handler) => handler(new MockDeviceOrientationEvent(0)));
      await Promise.resolve();
    });

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(0)),
        );
        await Promise.resolve();
      }
      jest.runAllTimers();
    });

    await act(async () => {
      mockNow = 1000;
      for (let i = 0; i < 5; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(90)),
        );
        await Promise.resolve();
      }
      jest.runAllTimers();
    });

    await act(async () => {
      mockNow = 1200;
      for (let i = 0; i < 5; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(90)),
        );
        await Promise.resolve();
      }
      jest.runAllTimers();
    });

    await act(async () => {
      mockNow = 1400;
      for (let i = 0; i < 5; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(90)),
        );
        await Promise.resolve();
      }
      jest.runAllTimers();
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
