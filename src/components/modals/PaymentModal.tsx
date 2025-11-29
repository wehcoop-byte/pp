
import React from "react";
import { Modal } from "../ui/Modal";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  total: string;
  onConfirm: () => void;
};

export default function PaymentModal({ isOpen, onClose, total, onConfirm }: PaymentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ready to Checkout"
      size="md"
      footer={
        <>
          <button onClick={onClose} className="rounded-full border border-white/20 text-white px-4 py-2">Cancel</button>
          <button onClick={onConfirm} className="rounded-full bg-emerald-500 text-slate-950 font-bold px-5 py-2">
            Pay {total}
          </button>
        </>
      }
      hideCloseButton
    >
      <p className="text-white/80">Your custom pawtrait looks set. Confirm to continue to checkout.</p>
    </Modal>
  );
}
