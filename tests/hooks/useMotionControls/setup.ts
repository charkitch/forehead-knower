// setup.ts
import "@testing-library/jest-dom";

// Define the event phase constants as readonly numbers
const EVENT_PHASE = {
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3,
} as const;

export class MockDeviceOrientationEvent implements DeviceOrientationEvent {
  readonly absolute: boolean = true;
  readonly alpha: number | null = 0;
  readonly beta: number | null;
  readonly gamma: number | null = 0;
  readonly bubbles: boolean = false;
  readonly cancelBubble: boolean = false;
  readonly cancelable: boolean = false;
  readonly composed: boolean = false;
  readonly currentTarget: EventTarget | null = null;
  readonly defaultPrevented: boolean = false;
  readonly eventPhase: number = EVENT_PHASE.NONE;
  readonly isTrusted: boolean = true;
  readonly returnValue: boolean = true;
  readonly srcElement: EventTarget | null = null;
  readonly target: EventTarget | null = null;
  readonly timeStamp: number = Date.now();
  readonly type: string = "deviceorientation";

  // Event phase constants with correct literal types
  readonly NONE: 0 = EVENT_PHASE.NONE;
  readonly CAPTURING_PHASE: 1 = EVENT_PHASE.CAPTURING_PHASE;
  readonly AT_TARGET: 2 = EVENT_PHASE.AT_TARGET;
  readonly BUBBLING_PHASE: 3 = EVENT_PHASE.BUBBLING_PHASE;

  constructor(beta: number) {
    this.beta = beta;
  }

  composedPath(): EventTarget[] {
    return [];
  }

  initEvent(): void {}
  preventDefault(): void {}
  stopImmediatePropagation(): void {}
  stopPropagation(): void {}
}

export const setupTests = () => {
  // Mock permissions API
  Object.defineProperty(global.navigator, "permissions", {
    value: {
      query: jest.fn().mockResolvedValue({ state: "granted" }),
    },
  });

  // Mock device orientation event
  Object.defineProperty(global, "DeviceOrientationEvent", {
    value: MockDeviceOrientationEvent,
  });
};
