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
    otp: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);


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
    if (otpSent && !formData.otp.trim()) {
      newErrors.otp = "OTP is required"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0
  }

  const sendOtp = async () => {

    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }))
      return
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Email is invalid" }))
      return
    }

    try {
      setSendingOtp(true)
      const res = await axios.post("/auth/user/send-otp", { email: formData.email })
      setOtpSent(true)
      toast.success("OTP sent to your email")
    } catch (error) {
      console.error("OTP error:", error)
      toast.error("Failed to send OTP")
    } finally {
      setSendingOtp(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (validateForm()) {
        setUserAuth(p => ({ ...p, isLoading: true }))

        const loginData = otpSent ?
          { ...formData } :
          { userName: formData.userName, email: formData.email, companyName: formData.companyName, mobile: formData.mobile }

        let res = await axios.post("/auth/user/login", loginData)

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

      // if (error?.response?.data?.error === "Invalid license") {
      //   setShowUnauthorizedModal(true)
      // } else {
      //   toast.error("Something went wrong");
      // }

      if (error?.response?.data?.error === "Invalid license") {
        setShowUnauthorizedModal(true);
      } else if (error?.response?.data?.error === "Invalid OTP") {
        setErrors(prev => ({ ...prev, otp: "Invalid OTP" }))
        toast.error("Invalid OTP");
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

                {/* <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                </div> */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">OTP</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-primary-red border-primary-red hover:bg-red-50"
                      onClick={sendOtp}
                      disabled={!formData.email || sendingOtp}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : otpSent ? "Resend OTP" : "Get OTP"}
                    </Button>
                  </div>
                  <Input
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className={errors.otp ? "border-red-500" : ""}
                    placeholder="Enter OTP sent to your email"
                  />
                  {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
                  {otpSent && (
                    <p className="text-sm text-gray-500">Enter the OTP sent to your email address</p>
                  )}
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


