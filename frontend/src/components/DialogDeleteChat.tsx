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
            aria-label="alert-dialog-logout"
            >
            <DialogTitle id="alert-dialog-logout-title">{"Are you sure you want to log out?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-logout-description">
                    Logging out will sign you out of Buildbuddy and you will have to log in again.
                </DialogContentText>
                <DialogActions>
                <Button onClick={handleClose} variant="contained" color="secondary">{agreeText}</Button>
                <Button onClick={handleFunctionInternal} variant="contained" autoFocus>
                    {disagreeText}
                </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};

export default DialogDeleteChat;