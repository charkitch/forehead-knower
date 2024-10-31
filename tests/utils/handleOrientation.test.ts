import { handleOrientation } from "@/utils/handleOrientation";

describe("handleOrientation", () => {
  let mockSetLastBeta: jest.Mock;
  let mockSetCurrentPosition: jest.Mock;
  let mockOnFlipUp: jest.Mock;
  let mockOnFlipDown: jest.Mock;
  let mockSmoothBeta: jest.Mock;
  let isProcessingAction: { current: boolean };
  let lastActionTime: { current: number };
  let hasReturnedToNeutral: { current: boolean };

  beforeEach(() => {
    jest.useFakeTimers();
    mockSetLastBeta = jest.fn();
    mockSetCurrentPosition = jest.fn();
    mockOnFlipUp = jest.fn();
    mockOnFlipDown = jest.fn();
    mockSmoothBeta = jest.fn((beta) => beta);
    isProcessingAction = { current: false };
    lastActionTime = { current: 0 };
    hasReturnedToNeutral = { current: true };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const createEvent = (beta: number): DeviceOrientationEvent =>
    ({
      beta,
      alpha: 0,
      gamma: 0,
      absolute: false,
    }) as DeviceOrientationEvent;

  const createDefaultParams = (overrides = {}) => ({
    event: createEvent(0),
    setLastBeta: mockSetLastBeta,
    smoothBeta: mockSmoothBeta,
    calibrationBeta: 0,
    neutralThreshold: 10,
    actionThreshold: 20,
    currentPosition: "neutral" as const,
    setCurrentPosition: mockSetCurrentPosition,
    onFlipUp: mockOnFlipUp,
    onFlipDown: mockOnFlipDown,
    isProcessingAction,
    lastActionTime,
    hasReturnedToNeutral,
    ...overrides,
  });

  test("sets last beta value", () => {
    const params = createDefaultParams({ event: createEvent(45) });
    handleOrientation(params);
    expect(mockSetLastBeta).toHaveBeenCalledWith(45);
  });

  test("handles null beta value", () => {
    const params = createDefaultParams({
      event: { beta: null } as unknown as DeviceOrientationEvent,
    });
    handleOrientation(params);
    expect(mockSetLastBeta).toHaveBeenCalledWith(0);
  });

  test("stays in neutral position within threshold", () => {
    const params = createDefaultParams({
      event: createEvent(5),
      calibrationBeta: 0,
      neutralThreshold: 10,
      currentPosition: "up",
    });
    handleOrientation(params);
    expect(mockSetCurrentPosition).toHaveBeenCalledWith("neutral");
  });

  test("detects up position beyond threshold", () => {
    const params = createDefaultParams({
      event: createEvent(30),
      calibrationBeta: 0,
      actionThreshold: 20,
      hasReturnedToNeutral: { current: true },
      lastActionTime: { current: Date.now() - 2000 },
    });
    handleOrientation(params);
    expect(mockSetCurrentPosition).toHaveBeenCalledWith("up");
    expect(mockOnFlipUp).toHaveBeenCalled();
  });

  test("prevents rapid consecutive actions", () => {
    const initialTime = 1000;
    jest.setSystemTime(initialTime);

    const baseParams = {
      calibrationBeta: 0,
      actionThreshold: 20,
      neutralThreshold: 10,
      hasReturnedToNeutral: { current: true },
      lastActionTime: { current: initialTime - 2000 },
      isProcessingAction: { current: false },
    };

    let currentPosition = "neutral";
    mockSetCurrentPosition.mockImplementation(
      (newPos: "up" | "neutral" | "down") => {
        currentPosition = newPos;
      },
    );

    // First flip up action
    handleOrientation(
      createDefaultParams({
        ...baseParams,
        event: createEvent(30),
        currentPosition,
      }),
    );

    expect(mockOnFlipUp).toHaveBeenCalledTimes(1);
    expect(currentPosition).toBe("up");

    // Return to neutral
    handleOrientation(
      createDefaultParams({
        ...baseParams,
        event: createEvent(2),
        currentPosition,
        isProcessingAction,
        lastActionTime,
        hasReturnedToNeutral,
      }),
    );
    expect(currentPosition).toBe("neutral");

    // Wait for processing timeout and cooldown
    jest.advanceTimersByTime(2000);
    isProcessingAction.current = false;
    hasReturnedToNeutral.current = true;

    // Try second action
    jest.setSystemTime(initialTime + 3000);

    handleOrientation(
      createDefaultParams({
        ...baseParams,
        event: createEvent(30),
        currentPosition,
        isProcessingAction,
        lastActionTime,
        hasReturnedToNeutral,
      }),
    );

    expect(mockOnFlipUp).toHaveBeenCalledTimes(2);
  });

  test("processes smoothed beta values", () => {
    mockSmoothBeta.mockImplementation((beta) => beta * 0.5);
    const params = createDefaultParams({
      event: createEvent(40),
      calibrationBeta: 0,
      actionThreshold: 15,
      hasReturnedToNeutral: { current: true },
      lastActionTime: { current: Date.now() - 2000 },
    });

    handleOrientation(params);
    expect(mockSmoothBeta).toHaveBeenCalledWith(40);
    expect(mockSetCurrentPosition).toHaveBeenCalledWith("up");
  });

  test("prevents action callbacks while processing", () => {
    const params = createDefaultParams({
      event: createEvent(30),
      currentPosition: "neutral",
      isProcessingAction: { current: true },
      hasReturnedToNeutral: { current: true },
      lastActionTime: { current: Date.now() - 2000 },
    });

    handleOrientation(params);
    // Position can still update
    expect(mockSetCurrentPosition).toHaveBeenCalledWith("up");
    // But action callback is prevented
    expect(mockOnFlipUp).not.toHaveBeenCalled();
  });

  test("tracks position changes while processing", () => {
    const params = createDefaultParams({
      event: createEvent(5),
      currentPosition: "up",
      isProcessingAction: { current: true },
    });

    handleOrientation(params);
    expect(mockSetCurrentPosition).toHaveBeenCalledWith("neutral");
    expect(hasReturnedToNeutral.current).toBe(true);
  });
});
