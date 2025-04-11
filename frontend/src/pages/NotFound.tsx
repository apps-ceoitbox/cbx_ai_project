
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <Logo size="lg" className="mb-8" />
            <h1 className="text-6xl font-bold mb-4 text-ceo-red">404</h1>
            <p className="text-xl text-gray-300 mb-8 text-center">
                Oops! The page you're looking for doesn't exist.
            </p>
            <Link to="/">
                <Button className="bg-ceo-red hover:bg-red-700">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
                </Button>
            </Link>
        </div>
    );
};

export default NotFound;
