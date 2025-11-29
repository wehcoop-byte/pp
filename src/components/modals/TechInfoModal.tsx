
import React from "react";
import { Modal } from "../ui/Modal";

type TechInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  markdown?: string;
};

export default function TechInfoModal({ isOpen, onClose, markdown }: TechInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Technical Details" size="lg">
      <pre className="whitespace-pre-wrap text-sm text-white/90">{markdown}</pre>
    </Modal>
  );
}
