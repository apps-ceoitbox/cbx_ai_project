
import { CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

const SendEmailDialog = ({ emailSuccessOpen, setEmailSuccessOpen, sentToEmail }) => {
    return (
        <Dialog open={emailSuccessOpen} onOpenChange={setEmailSuccessOpen}>
            <DialogContent className="sm:max-w-md border-2 border-primary-red">
                <DialogHeader className="bg-primary-red text-white rounded-t-lg p-4 mt-3">
                    <DialogTitle className="flex items-center text-white">
                        <CheckCircle className="h-6 w-6 text-white mr-2" />
                        Email Sent Successfully
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 bg-white">
                    <p className="text-center font-medium text-black">
                        We have emailed the report on{" "}
                        <span className="text-primary-red font-semibold">{sentToEmail}</span> ID
                    </p>
                </div>
                <DialogFooter className="p-4 bg-white">
                    <Button
                        className="w-full bg-primary-red hover:bg-red-700 text-white"
                        onClick={() => setEmailSuccessOpen(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SendEmailDialog