
import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLoginPage() {
  const nav = useNavigate()
  const { toast } = useToast()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // For demo purposes, hardcoded admin credentials
      // In a real app, this would be a server-side authentication
      if (credentials.email === "admin@ceoitbox.com" && credentials.password === "admin123") {
        // Set admin session
        localStorage.setItem("adminAuthenticated", "true")
        nav("/admin")
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="border-primary-red">
          <CardHeader className="bg-primary-red text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription className="text-gray-100">Enter your admin credentials</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <Button onClick={handleSubmit} className="w-full bg-primary-red hover:bg-red-700">
              Login as Admin
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
