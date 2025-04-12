import { Button } from "@/components/ui/button";
import React from "react";

interface UnauthorizedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UnauthorizedModal: React.FC<UnauthorizedModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-red-500 mx-auto flex items-center justify-center mb-6">
                    <span className="text-white text-5xl font-bold">!</span>
                </div>

                <h2 className="text-3xl font-bold mb-4">Unauthorized Access</h2>

                <p className="text-gray-600 mb-6">
                    Unfortunately you are not authorised to access this app.
                    Please connect with CEOITBOX team at access@ceoitbox.in.
                </p>

                <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-10"
                    onClick={onClose}
                >
                    OK
                </Button>
            </div>
        </div>
    );
};

export default UnauthorizedModal;