"use client";
import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export function DialogDeleteChat({open, setOpen,handleFunction, agreeText, disagreeText}: {open:boolean, setOpen:(state: boolean)=> void, handleFunction:() => unknown, agreeText:string,
    disagreeText:string}) {

    const handleClose = () => {
        setOpen(false);
    }

    const handleFunctionInternal = () =>{
        setOpen(false);
        handleFunction();
    } 

    return (
        <Dialog
            open={open}
            aria-label="alert-dialog-delete-chat"
        >
            <DialogTitle id="alert-dialog-delete-chat-title">
                {"Are you sure you want to delete this chat?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-delete-chat-description">
                    Deleting this chat will permanently remove it and its messages. This action cannot be undone.
                </DialogContentText>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="secondary">{disagreeText}</Button>
                    <Button onClick={handleFunctionInternal} variant="contained" autoFocus>
                        {agreeText}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};

export default DialogDeleteChat;