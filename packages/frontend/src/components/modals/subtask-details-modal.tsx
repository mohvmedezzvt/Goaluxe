"use client";

import useEdit from "@/stores/useEdit";
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { AlertCircle, Calendar } from "lucide-react";
import React from "react";

const SubtaskDetailsModal = () => {
  const { isEditing, clearEdits } = useEdit();
  return (
    <Modal
      backdrop="blur"
      className="pt-4 border-t-8 border-red-800 "
      isOpen={!!isEditing.subtask}
      onClose={clearEdits}
    >
      <ModalContent className="max-w-2xl">
        <ModalHeader className="flex justify-between gap-8">
          <div className=" flex flex-col gap-1 ">
            <p className="text-2xl font-bold tracking-tight break-word">
              Eyad Ahmed Ahmed Ahmed Ahmed Ahmed Ahmed Ahmed Ahmed Ahmed Ahmed
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={15} />
              <p className="text-sm">...............date</p>
              <Chip size="sm" className="text-default-500 bg-opacity-40">
                days
              </Chip>
            </div>
          </div>
          <Chip
            classNames={{
              content: "flex items-center gap-2",
            }}
            className=" text-red-700 bg-red-900 bg-opacity-30"
          >
            <AlertCircle size={16} />
            <p>Overdue</p>
          </Chip>
        </ModalHeader>
        <ModalBody></ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubtaskDetailsModal;
