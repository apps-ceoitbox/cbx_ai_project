import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white text-white border border-red-500 max-w-sm">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        <LogOut className="text-red-500" />
                        <DialogTitle className="text-black">Confirm Logout</DialogTitle>
                    </div>
                    <DialogDescription className="text-black mt-2">
                        Are you sure you want to log out of your account?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-white hover:text-red-600" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>
                        Logout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutConfirmationModal;