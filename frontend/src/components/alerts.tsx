"use client";
import { useChatContext } from "@/context/ChatContext";
import { Alert, Snackbar } from "@mui/material";

export default function NotificationSystem() {
    const { openDialog, setopenDialog, dialogState, setdialogState } = useChatContext();
    const handleClose = () => {
        setopenDialog(false);
        setdialogState({ type: "success", message: "" });
    };

    return (
        <Snackbar open={openDialog} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={dialogState.type as "error" | "info" | "success" | "warning"} variant="filled" sx={{ width: "100%" }}>
                {dialogState.message}
            </Alert>
        </Snackbar>
    );
}
