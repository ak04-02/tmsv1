import React from "react";
import { Modal as MUIModal, Box, IconButton } from "@mui/material";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function Modal({ children, open, onClose }) {
  return (
    <MUIModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          position: "relative",
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          padding: 4,
          borderRadius: 2,
          width: 400,
          boxShadow: 24,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: (theme) => theme.palette.primary.main,
          }}
        >
          <AiOutlineCloseCircle size={24} />
        </IconButton>
        {children}
      </Box>
    </MUIModal>
  );
}
