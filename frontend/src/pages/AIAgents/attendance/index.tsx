import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AttendanceAnomaly } from "@/components/AttendanceAnomaly";
import { ArrowLeft } from "lucide-react";

const AttendanceMonitor = () => {
  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents">
        <Button style={{ minWidth: "100px", color: "#ffffff", border: "none", marginLeft: "40px", marginRight:"10px" }}
        className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
        variant="ghost">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 pb-1 inline-block">AI Attendance Anomaly</span>
        </h1>
      </div>
      
      <AttendanceAnomaly />
    </div>
  );
};

export default AttendanceMonitor;
