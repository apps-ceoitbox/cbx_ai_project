
import Header from "./Header";
import { ZoomaryHistory } from "../Zoomary/ZoomaryHistory";
import { useState } from "react";
import { CompanyProfileHistory } from "../hr/CompanyProfileHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const UserGeneratedAgentsResult = () => {
    const [selectedAgent, setSelectedAgent] = useState("zoom");

    return (
        <div className="min-h-screen">
            <Header />
            {selectedAgent === "zoom" &&
                <div className="mt-6 px-8">
                    <div style={{ width: "20%" }}>
                        <Label htmlFor="tool-filter">Agents</Label>
                        <Select value={selectedAgent} onValueChange={(value) => setSelectedAgent(value)}>
                            <SelectTrigger id="tool-filter">
                                <SelectValue placeholder="All agents" />
                            </SelectTrigger>
                            <SelectContent>

                                <SelectItem value="zoom">
                                    Zoom AI History
                                </SelectItem>
                                <SelectItem value="companyProfile">
                                    Company Profile History
                                </SelectItem>

                            </SelectContent>
                        </Select>
                    </div>

                </div>
            }

            <div>
                {selectedAgent === "zoom" ?
                    <ZoomaryHistory />
                    : <CompanyProfileHistory setSelectedAgent={setSelectedAgent} selectedAgent={selectedAgent} />
                }
            </div>
        </div >
    );
};

export default UserGeneratedAgentsResult;
