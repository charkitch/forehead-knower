import { checkIOSPermissionAPI } from "@/utils/checkIOSPermissionAPI";

describe("checkIOSPermissionAPI", () => {
  it("returns false if window is undefined", () => {
    expect(checkIOSPermissionAPI(undefined as unknown as Window)).toBe(false);
  });

  it("returns false if DeviceOrientationEvent is undefined", () => {
    const mockWindow = {} as Window;
    expect(checkIOSPermissionAPI(mockWindow, undefined)).toBe(false);
  });

  it("returns true if DeviceOrientationEvent.requestPermission exists as a function", () => {
    const mockWindow = {} as Window;
    const mockDeviceOrientationEvent = {
      requestPermission: jest.fn(),
    } as unknown as typeof DeviceOrientationEvent;

    expect(checkIOSPermissionAPI(mockWindow, mockDeviceOrientationEvent)).toBe(
      true,
    );
  });

  it("returns false if DeviceOrientationEvent.requestPermission does not exist", () => {
    const mockWindow = {} as Window;
    const mockDeviceOrientationEvent = {} as typeof DeviceOrientationEvent;

    expect(checkIOSPermissionAPI(mockWindow, mockDeviceOrientationEvent)).toBe(
      false,
    );
  });

  it("returns false if an error is thrown when checking requestPermission", () => {
    const mockWindow = {} as Window;
    const mockDeviceOrientationEvent = {
      get requestPermission() {
        throw new Error("Test error");
      },
    } as unknown as typeof DeviceOrientationEvent;

    expect(checkIOSPermissionAPI(mockWindow, mockDeviceOrientationEvent)).toBe(
      false,
    );
  });
});
