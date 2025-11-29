
import React from "react";
import { Modal } from "../ui/Modal";

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function InfoModal({ isOpen, onClose, title = "Information", children }: InfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {children}
    </Modal>
  );
}
