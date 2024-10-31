import { renderHook, act } from "@testing-library/react";
import { useMotionControls } from "@/utils/useMotionControls";
import { setupTests, MockDeviceOrientationEvent } from "./setup";

describe("useMotionControls - Motion Detection", () => {
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

  it("should detect upward motion", async () => {
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
      jest.runAllTimers();
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
        jest.advanceTimersByTime(100);
        mockNow += 100;
      }

      handlers.forEach((handler) =>
        handler(new MockDeviceOrientationEvent(90)),
      );
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(onFlipUp).toHaveBeenCalled();
    expect(result.current.currentPosition).toBe("up");
  });

  it("should not trigger multiple actions in quick succession", async () => {
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
      jest.runAllTimers();
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

      for (let i = 0; i < 10; i++) {
        handlers.forEach((handler) =>
          handler(new MockDeviceOrientationEvent(90)),
        );
        await Promise.resolve();
        jest.advanceTimersByTime(100);
        mockNow += 100;
      }

      jest.runAllTimers();
    });

    expect(onFlipUp).toHaveBeenCalledTimes(1);
  });
});
