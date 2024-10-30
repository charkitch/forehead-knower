import { Smartphone } from "lucide-react";

interface MotionControlsProps {
  isEnabled: boolean;
  onEnable: () => void;
  onCalibrate: () => void;
}

export function MotionControls({
  isEnabled,
  onEnable,
  onCalibrate,
}: MotionControlsProps) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-5 h-5" />
        <span className="font-medium">Motion Controls</span>
      </div>
      {!isEnabled ? (
        <button
          onClick={onEnable}
          className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600"
        >
          Enable Motion Controls
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-blue-600">
            Motion controls are enabled! Flip your phone up for correct answers
            and down for skips.
          </p>
          <button
            onClick={onCalibrate}
            className="w-full bg-blue-100 text-blue-700 rounded py-2 px-4 hover:bg-blue-200 text-sm"
          >
            Recalibrate Motion Controls
          </button>
        </div>
      )}
    </div>
  );
}
