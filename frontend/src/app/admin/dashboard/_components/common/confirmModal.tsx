import React from "react";

interface ConfirmModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/*
* 설정에 따른 action 취하는 modal 입니다.
*
* [출처](https://github.com/prgrms-be-devcourse/NBE6-8-1-Team14/blob/main/frontend/src/components/modal/ConfirmModal.tsx)
*/
const ConfirmModal = ({
  message,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-8 w-min-80">
        <div className="mb-6 text-center text-lg font-semibold">
          {message.split("\n").map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx !== message.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600"
          >
            {confirmText}
          </button>
          {cancelText ? (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {cancelText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
