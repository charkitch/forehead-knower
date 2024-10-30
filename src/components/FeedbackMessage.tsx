import { BasicModal } from "@/components/BasicModal";

interface FeedbackModalProps {
  message: string;
}

export function FeedbackMessage({ message }: FeedbackModalProps) {
  return (
    <BasicModal>
      <div className="feedback-modal text-2xl font-bold text-center">
        {message}
      </div>
    </BasicModal>
  );
}
