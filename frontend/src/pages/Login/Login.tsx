import type React from "react"
import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useAxios, useData } from "@/context/AppContext"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import UnauthorizedModal from "./UnauthorizedModal"


export default function LoginPage() {
  const nav = useNavigate();
  const { userAuth, setUserAuth } = useData();
  const axios = useAxios("user");
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    companyName: "",
    mobile: "",
  });


  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userName.trim()) {
      newErrors.userName = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // if (!formData.companyName.trim()) {
    //   newErrors.companyName = "Company name is required"
    // }

    // if (!formData.mobile.trim()) {
    //   newErrors.mobile = "Mobile number is required"
    // } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
    //   newErrors.mobile = "Mobile number should be 10 digits"
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0
  }




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (validateForm()) {
        setUserAuth(p => ({ ...p, isLoading: true }))

        let res = await axios.post("/auth/user/login", formData)

        if (res?.data?.error === "Invalid license") {
          setShowUnauthorizedModal(true)
          setUserAuth(p => ({ ...p, isLoading: false }))
          return
        }

        setUserAuth(p => {
          return {
            ...p,
            token: res?.data?.token,
            user: res?.data?.data,
            isLoading: false
          }
        })

        localStorage.setItem("userToken", res?.data?.token);
        toast.success("Login successful");
        nav("/home")
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error?.response?.data?.error === "Invalid license") {
        setShowUnauthorizedModal(true)
      } else {
        toast.error("Something went wrong");
      }

      toast.error("Something went wrong");
      setUserAuth(p => ({ ...p, isLoading: false }))
    }
  }


  const closeUnauthorizedModal = () => setShowUnauthorizedModal(false)


  useEffect(() => {
    if (!userAuth.user) {
      nav("/login")
    }
  }, [userAuth.user])

  if (userAuth.user) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div
    // style={{ position: "relative" }}
    >
      <div style={{ position: "relative" }} className="py-6 pl-8 bg-black">
        <Logo size="lg" />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="w-full max-w-[480px]">


          <Card className="border-primary-red">
            <CardHeader className="bg-primary-red text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription className="text-gray-100">Enter your Registered Email ID to access CEOITBOX AI Tools</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className={errors.userName ? "border-red-500" : ""}
                  />
                  {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                </div>


                <Button
                  type="submit"
                  disabled={!formData.userName || !formData.email}
                  onClick={handleSubmit} className="w-full bg-primary-red hover:bg-red-700 mt-5">
                  {userAuth.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
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
