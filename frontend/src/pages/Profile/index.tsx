import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/context/AppContext";
import { useAxios } from "@/context/AppContext";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function Profile() {
    const { userAuth, setUserAuth } = useData();
    const axios = useAxios("user");
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(userAuth?.user || null);
    const [originalData, setOriginalData] = useState(userAuth?.user || null); 

    const hasChanges = useMemo(() => {
        if (!originalData || !userData) return false;
        // Compare all fields
        return JSON.stringify(originalData) !== JSON.stringify(userData);
    }, [originalData, userData]);


    useEffect(() => {
        // Update userData whenever userAuth changes
        setUserData(userAuth?.user || null);
        setOriginalData(userAuth?.user || null);
    }, [userAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post("/users/profile", userData);
            if (response?.data?.success) {  
                toast.success("Profile updated successfully!");
                // Update both the userAuth and originalData after successful save
                const updatedData = response.data.data;
                setUserAuth(prev => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        ...updatedData
                    }
                }));
                setOriginalData(updatedData);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };    

    const handleInputChange = (field: string, value: string) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            setUserData(prev => ({
                ...prev,
                [parent]: {
                    ...prev?.[parent],
                    [child]: value
                }
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>                                    <Input
                                        id="name"
                                        value={userData?.userName || ""}
                                        onChange={(e) => handleInputChange("userName", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        disabled    
                                        id="email"
                                        type="email"
                                        value={userData?.email || ""}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Company Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Company Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={userData?.companyName || ""}
                                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyWebsite">Company Website</Label>
                                    <Input
                                        id="companyWebsite"
                                        type="url"
                                        value={userData?.companyWebsite || ""}
                                        onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="businessDescription">Business Description</Label>
                                    <Textarea
                                        id="businessDescription"
                                        value={userData?.businessDescription || ""}
                                        onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="targetCustomer">Target Customer</Label>
                                    <Textarea
                                        id="targetCustomer"
                                        value={userData?.targetCustomer || ""}
                                        onChange={(e) => handleInputChange("targetCustomer", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="businessType">Business Type</Label>
                                    <select
                                        id="businessType"
                                        value={userData?.businessType || "b2b"}
                                        onChange={(e) => handleInputChange("businessType", e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="b2b">B2B</option>
                                        <option value="b2c">B2C</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="uniqueSellingPoint">What Makes You Different</Label>
                                    <Input
                                        id="uniqueSellingPoint"
                                        value={userData?.uniqueSellingPoint || ""}
                                        onChange={(e) => handleInputChange("uniqueSellingPoint", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Social Media Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        type="url"
                                        value={userData?.socialLinks?.linkedin || ""}
                                        onChange={(e) => handleInputChange("socialLinks.linkedin", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        type="url"
                                        value={userData?.socialLinks?.facebook || ""}
                                        onChange={(e) => handleInputChange("socialLinks.facebook", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        type="url"
                                        value={userData?.socialLinks?.instagram || ""}
                                        onChange={(e) => handleInputChange("socialLinks.instagram", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        type="url"
                                        value={userData?.socialLinks?.twitter || ""}
                                        onChange={(e) => handleInputChange("socialLinks.twitter", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !hasChanges}
                        >
                            {isLoading ? "Saving..." : hasChanges ? "Save Profile" : "No Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
