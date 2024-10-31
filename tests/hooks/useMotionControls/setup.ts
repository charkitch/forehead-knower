import "@testing-library/jest-dom";
import { EventHandler } from "react";

export class MockDeviceOrientationEvent extends Event {
  beta: number;

  constructor(beta: number) {
    super("deviceorientation");
    this.beta = beta;
  }
}

export const setupTests = () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.removeEventListener = jest.fn();
    window.addEventListener = jest.fn();

    const mockDeviceOrientationEvent = {
      requestPermission: jest.fn().mockResolvedValue("granted"),
    };

    (global as EventHandler).DeviceOrientationEvent =
      mockDeviceOrientationEvent;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();

    delete (global as EventHandler).DeviceOrientationEvent;
  });
};
