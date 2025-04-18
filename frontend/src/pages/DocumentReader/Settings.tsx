

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
    return (

        <div className="max-w-5xl mx-auto min-h-screen py-5">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-appBlack mb-2">Settings</h1>
                <p className="text-appGray-700">
                    Configure your application preferences
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Document Processing Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-appGray-700">
                        Settings page functionality will be implemented in future updates.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;