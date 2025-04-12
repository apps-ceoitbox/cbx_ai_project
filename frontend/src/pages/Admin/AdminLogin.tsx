
import type React from "react"

import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAxios, useData } from "@/context/AppContext"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { setAdminAuth, adminAuth } = useData();
  const { isLoading } = adminAuth || {};
  const axios = useAxios("admin")
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))

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

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      try {
        setAdminAuth(prev => ({ ...prev, isLoading: true }))

        const response = await axios.post("/auth/admin/login", credentials);

        if (response.status !== 200) {
          toast.error("Invalid email or password")
          return
        }

        setAdminAuth({
          token: response.data.token,
          user: response.data.user,
          isLoading: false,
        })

        toast.success("Login successful")
        localStorage.setItem("adminToken", response.data.token)
        nav("/admin")
      } catch (error) {
        toast.error(error?.response?.data?.message)
        console.error("Login error:", error)
      } finally {
        setAdminAuth(prev => ({ ...prev, isLoading: false }))
      }
    }
  }

  if (adminAuth.user) {
    return <Navigate to="/admin" />
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute" }} className="p-8">
        <Logo size="lg" className="mb-8" />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">

        <div className="w-full max-w-md">
          {/* <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div> */}

          <Card className="border-primary-red">
            <CardHeader className="bg-primary-red text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
              <CardDescription className="text-gray-100">Enter your admin credentials</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
              </form>
            </CardContent>

            <CardFooter>
              <Button
                disabled={!credentials.password || !credentials.email}
                onClick={handleSubmit} className="w-full bg-primary-red hover:bg-red-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </Button>
            </CardFooter>

          </Card>
        </div>
      </div>
    </div>
  )
}
