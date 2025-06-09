import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Briefcase, Calendar, BarChart } from "lucide-react";

const AttendanceMonitor = () => {
  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents">
          <Button variant="outline" className="mr-4 border-gray-300 hover:border-red-600 hover:text-red-600">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 pb-1 inline-block">Attendance Monitor</span>
        </h1>
      </div>
      
      <Card className="mb-8 border border-gray-200 hover:border-red-400 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-gray-800">Attendance Monitoring with AI</CardTitle>
          <CardDescription className="text-gray-600">
            Detect patterns and anomalies in attendance data using advanced AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              The Attendance Monitor feature is currently under development. It will allow you to track attendance patterns, identify anomalies, and generate insightful reports.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-xl mt-4">
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Clock className="h-6 w-6 text-red-500 mb-2" />
                <span className="text-sm text-gray-700">Time Tracking</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Briefcase className="h-6 w-6 text-red-500 mb-2" />
                <span className="text-sm text-gray-700">Work Patterns</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <BarChart className="h-6 w-6 text-red-500 mb-2" />
                <span className="text-sm text-gray-700">Analytics</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Calendar className="h-6 w-6 text-red-500 mb-2" />
                <span className="text-sm text-gray-700">Scheduling</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceMonitor;
