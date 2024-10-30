import React from "react";

interface BasicModalProps {
  children: React.ReactNode;
}

export function BasicModal({ children }: BasicModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">{children}</div>
    </div>
  );
}
