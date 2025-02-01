import React, { forwardRef, useImperativeHandle, useState } from "react";
import './style.scss'

const DeleteDialog = forwardRef(({ action }, ref) => {
  const [open, setOpen] = useState(false); // State to control dialog visibility

  // Expose the handleOpen method to the parent
  useImperativeHandle(ref, () => ({
    handleOpen: () => setOpen(true),
    handleClose: () => setOpen(false),
  }));

  const handleConfirm = () => {
    action(); // Call the delete action passed as a prop
    setOpen(false); // Close the dialog
  };

  return (
    open && (
      <div className="delete-box" onClick={() => setOpen(false)}>
        <div className="delete-content"on onClick={(e) => e.stopPropagation()}>
          <div className="delete-msg">
            <div className="delete-title">Are you sure you want to permanently delete this item?</div>
            <div className="delete-text">
            This action cannot be undone. All associated data, including related records, will be permanently removed.
            </div>
          </div>
          <div className="action-btns">
            <button className="delete-btn" onClick={handleConfirm}>
              Delete
            </button>
            <button className="cancel-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
});

export default DeleteDialog;
