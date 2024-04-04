import { Dialog } from '@material-ui/core';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteFile, deleteFileAllVersions, deleteFileVersion, formatString } from '../../manager/SettingsManager';
import AppContext from '../../context/AppContext';

export default function DeleteFileVersionDialog({
    dialogOpen,
    setDialogOpen,
    file,
    changes,
    setChanges,
    deleteVersion = false,
    deleteAllVersions = false,
}) {
    const ctx = useContext(AppContext);
    const { t } = useTranslation();
    const toggleShowDialog = () => {
        setDialogOpen(!dialogOpen);
    };

    async function deleteF() {
        if (deleteVersion) {
            deleteFileVersion(file, ctx, changes, setChanges).then();
        } else if (deleteAllVersions) {
            deleteFileAllVersions({ file, changes, setChanges, isTrash: true }).then();
        } else {
            deleteFile(file, ctx, changes, setChanges).then();
        }
        setDialogOpen(false);
    }

    return (
        <Dialog open={true} onClose={toggleShowDialog}>
            <DialogTitle>Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {formatString(t('delete_trash_item_confirmation_desc'), [file.name])}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={toggleShowDialog}>Cancel</Button>
                <Button onClick={() => deleteF()}>Delete</Button>
            </DialogActions>
        </Dialog>
    );
}
