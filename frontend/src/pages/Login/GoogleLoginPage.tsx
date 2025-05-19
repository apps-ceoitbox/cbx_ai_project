import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useData } from "@/context/AppContext"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import UnauthorizedModal from "./UnauthorizedModal"

export default function GoogleLoginPage() {
    const nav = useNavigate();
    const { apiLink, userAuth, setUserAuth } = useData();
    const [loading, setLoading] = useState(false);
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);

            window.location.href = `${apiLink}auth/user/google`;


        } catch (error) {
            console.error("Google login error:", error);

            if (error?.response?.data?.error === "Invalid license") {
                setShowUnauthorizedModal(true);
            } else {
                toast.error("Failed to login with Google");
            }

        } finally {
            setLoading(false);
        }
    };

    const closeUnauthorizedModal = () => setShowUnauthorizedModal(false);

    useEffect(() => {
        // Check if there's any Google OAuth response in URL (for redirect flow)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('userData');

        if (token && userData) {
            try {
                const parsedUserData = JSON.parse(decodeURIComponent(userData));
                setUserAuth({
                    token,
                    user: parsedUserData,
                    isLoading: false
                });
                localStorage.setItem("userToken", token);
                toast.success("Login successful");
                nav("/home");
            } catch (error) {
                console.error("Error parsing OAuth response:", error);
                toast.error("Authentication failed");
            }
        }
    }, []);

    if (userAuth.user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div style={{ position: "relative" }} className="min-h-screen flex flex-col items-center justify-center  bg-black ">
            <div style={{ position: "absolute", top: 0, left: 0 }} className="py-6 pl-8 bg-black">
                <Logo size="lg" />
            </div>

            <div className=" bg-black p-4">
                <div className="w-full max-w-[480px]">
                    <Card className="border-primary-red">
                        <CardHeader className="bg-primary-red text-white rounded-t-lg">
                            <CardTitle className="text-2xl font-bold">Login</CardTitle>
                            <CardDescription className="text-gray-100">Access CEOITBOX AI Tools with your Google account</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6 pb-8">
                            <div className="flex flex-col items-center space-y-6">
                                <div className="text-center">
                                    <p className="text-lg font-medium mb-2">Sign in with Google</p>
                                    <p className="text-sm text-gray-500">
                                        Use your Google account to quickly access all CEOITBOX features
                                    </p>
                                </div>

                                <Button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 py-6 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            <span className="ml-2 text-base font-medium">Continue with Google</span>
                                        </>
                                    )}
                                </Button>

                                <div className="text-center text-sm text-gray-500 max-w-xs">
                                    By continuing, you agree to CEOITBOX's Terms of Service and Privacy Policy
                                </div>
                            </div>
                        </CardContent>

                        <div className="py-2">
                            <p className="text-center text-[14px] font-[500]">© 2025 CEOITBOX. All rights reserved.</p>
                        </div>
                    </Card>
                </div>
            </div>

            <UnauthorizedModal
                isOpen={showUnauthorizedModal}
                onClose={closeUnauthorizedModal}
            />
        </div>
    )
}