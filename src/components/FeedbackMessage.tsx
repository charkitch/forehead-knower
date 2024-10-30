interface FeedbackMessageProps {
  message: string;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
}) => {
  return (
    <div className="feedback-message text-lg font-semibold text-center">
      {message}
    </div>
  );
};
