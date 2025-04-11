"use client"
import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

// Global state to manage the dialog visibility and content
let setDialogState: ((arg0: boolean) => void) | null = null;
let setKeyContent: React.Dispatch<React.SetStateAction<string>> | null = null;

// Component for the actual dialog
const ParticipantKeyAlertDialog = () => {
    // Local state for the dialog
    const [isOpen, setIsOpen] = useState(false);
    const [key, setKey] = useState('');
    const [copied, setCopied] = useState(false);

    // Store setters in global variables for external control
    setDialogState = setIsOpen;
    setKeyContent = setKey;

    // Function to copy the key to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(key).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Zugangsschlüssel</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dies ist der Zugangsschlüssel des Teilnehmers. Bewahre ihn sicher auf.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-4 relative bg-gray-100 p-4 rounded-md flex items-center justify-between hover:cursor-pointer" onClick={copyToClipboard}>
                    <code className=" text-lg overflow-x-auto">
                        {key}
                    </code>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="right-2 top-2 hover:cursor-pointer"

                    >
                        <Copy size={16} />
                        <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
                    </Button>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction>Schließen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// Export the function to show the dialog with a key
export const showParticipantKey = (key: any) => {
    if (setDialogState && setKeyContent) {
        setKeyContent(key);
        setDialogState(true);
    } else {
        console.error('ParticipantKeyAlertDialog must be mounted in your application');
    }
};

// Export both the dialog component and the function
export default ParticipantKeyAlertDialog;