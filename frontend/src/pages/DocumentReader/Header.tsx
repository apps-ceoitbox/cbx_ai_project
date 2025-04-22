import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext';
import { ArrowLeft, LogOut } from 'lucide-react'; //LayoutDashboard
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setUserAuth } = useData();


    return (
        <header className="bg-black text-white p-4 px-10  shadow-md">
            <div className="mx-auto flex justify-between items-center">

                <div>
                    {location.pathname !== "/document-reader" &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav(-1);
                            }}
                        >
                            <ArrowLeft className="w-5 h-5 " />
                            Back
                        </Button>
                    }
                </div>
                <div className="flex items-center gap-4">
                    {/* {location.pathname !== "/astro-reports" &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav("/documents-dashboard")
                            }}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Button>
                    } */}



                    <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                        onClick={() => {
                            localStorage.removeItem("userToken")
                            setUserAuth(p => ({ ...p, user: null, token: null }))
                            toast.success("Logout successful")
                            nav("/login")
                        }}>
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </div>
            </div>
        </header >

    )
}

export default Header