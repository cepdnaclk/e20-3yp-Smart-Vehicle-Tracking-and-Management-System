import React from "react";
import { Modal, Button } from "react-bootstrap";
import { AlertTriangle } from "lucide-react";

/**
 * A reusable confirmation modal for delete operations
 */
const DeleteConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  itemType, 
  itemName, 
  additionalMessage 
}) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" className="delete-confirmation-modal">
      <Modal.Header className="border-0 pb-0">
        <div className="d-flex align-items-center text-danger">
          <AlertTriangle size={24} className="me-2 text-danger" />
          <Modal.Title className="text-danger">Confirm Deletion</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p>
          Are you sure you want to delete this {itemType.toLowerCase()}: <strong>{itemName}</strong>?
        </p>
        <p className="mb-0 text-danger fw-medium">
          This action cannot be undone.
        </p>
        {additionalMessage && (
          <p className="mt-2 text-danger">
            {additionalMessage}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete {itemType}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
