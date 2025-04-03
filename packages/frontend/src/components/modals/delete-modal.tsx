import { useDelete } from "@/hooks/use-delete";
import useDeleteStore from "@/stores/useDelete";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import React from "react";

/**
 * A dialog component that confirms goal deletion with the user.
 *
 * @component
 * @description Displays a modal dialog with a warning message about permanent goal deletion
 * and provides options to either proceed with deletion or cancel the operation.
 *
 * @example
 * ```tsx
 * <DeleteDialog />
 * ```
 *
 * @returns {JSX.Element} A modal dialog component with header, body text, and action buttons
 *
 * @dependencies
 * - useDeleteStore hook - Provides setDelete function to manage deletion state
 * - useDelete hook - Provides handleDelete function and isDeleting state
 * - Modal components from UI library
 */
const DeleteModal = () => {
  const { isDeleting, clearDeletes } = useDeleteStore();
  const { handleDelete, deleteLoading } = useDelete(); // Hook for deleting goals

  return (
    <Modal
      backdrop="blur"
      isOpen={!!isDeleting.goal || !!isDeleting.subtask}
      onClose={() => clearDeletes()}
    >
      <ModalContent className="text-foreground-800">
        <ModalHeader> Are you sure?</ModalHeader>
        <ModalBody>
          This action cannot be undone. This will permanently delete your
          {isDeleting.subtask?.subtaskId ? " subtask " : " goal "}
          and remove it from our servers.
        </ModalBody>
        <ModalFooter>
          <Button onPress={() => clearDeletes()}>Cancel</Button>
          <Button
            isLoading={deleteLoading}
            onPress={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;
