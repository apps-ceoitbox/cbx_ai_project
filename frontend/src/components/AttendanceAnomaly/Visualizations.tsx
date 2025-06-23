import React, { useEffect, useRef } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { AttendanceData, PolicyConfig, AnalysisResult } from './types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface VisualizationsProps {
  data: AttendanceData;
  selectedMonth?: number;
  selectedYear?: number;
  policyConfig?: PolicyConfig;
  analysisResult?: AnalysisResult | null;
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  data,
  selectedMonth,
  selectedYear,
  policyConfig}) => {
  // Create refs for charts to optimize them for printing
  const chartRefs = useRef<(ChartJS | null)[]>([]);
  
  // Effect to optimize charts for print/PDF
  useEffect(() => {
    // Check if we're in print mode by looking for the 'printing' class on any parent
    const isPrinting = document.querySelector('.printing') !== null;
    
    if (isPrinting) {
      // For each chart, ensure it's properly rendered for print
      chartRefs.current.forEach(chart => {
        if (chart) {
          // Force chart resize to ensure it renders at the correct size
          setTimeout(() => {
            chart.resize();
            // Update the chart to reflect the new size
            chart.update('none');
          }, 100);
        }
      });
    }
  }, []);
  // Get day information (name, if Sunday or Second Saturday)
  const getDayInfo = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isSunday = date.getDay() === 0;
    const isSecondSaturday = date.getDay() === 6 && Math.floor((day - 1) / 7) === 1;
    
    return { dayName, isSunday, isSecondSaturday };
  };
  const processAttendanceData = () => {
    const employeeNames = data.records.map(record => record.name.split(' ')[0]); // First name only
    const lateArrivals = data.records.map(record => {
      return record.dailyRecords.filter(daily => {
        if (!daily.checkIn || daily.isOff) return false;
        const checkInTime = daily.checkIn;
        const requiredCheckIn = policyConfig?.checkInTime || '09:00';
        return checkInTime > requiredCheckIn;
      }).length;
    });

    const earlyDepartures = data.records.map(record => {
      return record.dailyRecords.filter(daily => {
        if (!daily.checkOut || daily.isOff || daily.isHalfDay) return false;
        const checkOutTime = daily.checkOut;
        const requiredCheckOut = policyConfig?.checkOutTime || '18:00';
        return checkOutTime < requiredCheckOut;
      }).length;
    });

    const workHourShortfalls = data.records.map(record => {
      const shortfalls = record.dailyRecords.filter(daily => {
        if (daily.isOff || daily.isAbsent) return false;
        if (!daily.checkIn || !daily.checkOut) return false;
        
        // Simple duration calculation in hours
        const checkInParts = daily.checkIn.split(':').map(Number);
        const checkOutParts = daily.checkOut.split(':').map(Number);
        
        const checkInMinutes = checkInParts[0] * 60 + checkInParts[1];
        const checkOutMinutes = checkOutParts[0] * 60 + checkOutParts[1];
        
        const durationMinutes = checkOutMinutes - checkInMinutes;
        const durationHours = durationMinutes / 60;
        
        const requiredHours = policyConfig?.requiredHours || 8;
        return durationHours < requiredHours;
      });
      return shortfalls.length;
    });

    // Attendance status distribution
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let offDayCount = 0;

    data.records.forEach(record => {
      record.dailyRecords.forEach(daily => {
        if (daily.isOff) offDayCount++;
        else if (daily.isAbsent) absentCount++;
        else if (daily.isHalfDay) halfDayCount++;
        else presentCount++;
      });
    });

    return {
      employeeNames,
      lateArrivals,
      earlyDepartures,
      workHourShortfalls,
      attendanceDistribution: {
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        off: offDayCount
      }
    };
  };

  const chartData = processAttendanceData();

  const calculatePolicyMetrics = () => {
    let lateArrivalsCount = 0;
    let earlyDeparturesCount = 0;
    let shortfallsCount = 0;
    let overtimeCount = 0;
    let holidayWorkCount = 0;
    let policyViolationsCount = 0;
    
    // First, let's apply policy checks to ensure flags are set
    const processedRecords = data.records.map(record => {
      const updatedRecord = { ...record };
      
      updatedRecord.dailyRecords = record.dailyRecords.map(dailyRecord => {
        const { day, checkIn, checkOut, isOff, isAbsent, isHalfDay } = dailyRecord;
        const flags: string[] = dailyRecord.flags || [];
        
        // Skip policy checks for off days, absents, or half days
        if (isOff || isAbsent || isHalfDay) {
          return { ...dailyRecord, flags };
        }
        
        const dayInfo = getDayInfo(day);
        const isHoliday = (policyConfig?.sundayHoliday && dayInfo.isSunday) || 
                         (policyConfig?.secondSaturdayHoliday && dayInfo.isSecondSaturday) ||
                         (policyConfig?.customHolidays?.includes(day) || false);
        
        // Skip policy checks for holidays unless explicitly configured to check
        if (isHoliday && !policyConfig?.checkHolidays) {
          return { ...dailyRecord, flags, isHoliday };
        }
        
        // Check for late arrival
        if (checkIn && policyConfig?.checkInTime) {
          const checkInTime = new Date(`2000-01-01T${checkIn}`);
          const policyCheckInTime = new Date(`2000-01-01T${policyConfig.checkInTime}`);
          
          if (checkInTime > policyCheckInTime && !flags.includes('late-arrival')) {
            flags.push('late-arrival');
          }
        }
        
        // Check for early departure
        if (checkOut && policyConfig?.checkOutTime) {
          const checkOutTime = new Date(`2000-01-01T${checkOut}`);
          const policyCheckOutTime = new Date(`2000-01-01T${policyConfig.checkOutTime}`);
          
          if (checkOutTime < policyCheckOutTime && !flags.includes('early-departure')) {
            flags.push('early-departure');
          }
        }
        
        // Check for work hour shortfall
        if (checkIn && checkOut && policyConfig?.requiredHours) {
          const checkInTime = new Date(`2000-01-01T${checkIn}`);
          const checkOutTime = new Date(`2000-01-01T${checkOut}`);
          
          // Calculate hours worked
          const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursWorked < policyConfig.requiredHours && !flags.includes('shortfall')) {
            flags.push('shortfall');
          } else if (hoursWorked > policyConfig.requiredHours + 2 && !flags.includes('overtime')) { // 2 hours overtime threshold
            flags.push('overtime');
          }
        }
        
        // Check for holiday work
        if (isHoliday && checkIn && checkOut && !flags.includes('holiday-work')) {
          flags.push('holiday-work');
        }
        
        return { ...dailyRecord, flags, isHoliday };
      });
      
      return updatedRecord;
    });
    
    // Now count the flags
    processedRecords.forEach(employee => {
      employee.dailyRecords.forEach(daily => {
        if (!daily.flags || daily.flags.length === 0) return;
        
        daily.flags.forEach(flag => {
          if (flag === 'late-arrival') {
            lateArrivalsCount++;
            policyViolationsCount++;
          } else if (flag === 'early-departure') {
            earlyDeparturesCount++;
            policyViolationsCount++;
          } else if (flag === 'shortfall') {
            shortfallsCount++;
            policyViolationsCount++;
          } else if (flag === 'overtime') {
            overtimeCount++;
          } else if (flag === 'holiday-work') {
            holidayWorkCount++;
            policyViolationsCount++;
          }
        });
      });
    });
    
    return {
      lateArrivals: lateArrivalsCount,
      earlyDepartures: earlyDeparturesCount,
      shortfalls: shortfallsCount,
      overtime: overtimeCount,
      holidayWork: holidayWorkCount,
      policyViolations: policyViolationsCount
    };
  };
  
  const policyMetrics = calculatePolicyMetrics();

  const lateArrivalsChartData = {
    labels: chartData.employeeNames,
    datasets: [{
      label: 'Late Arrivals',
      data: chartData.lateArrivals,
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  const earlyDeparturesChartData = {
    labels: chartData.employeeNames,
    datasets: [{
      label: 'Early Departures',
      data: chartData.earlyDepartures,
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const workHoursChartData = {
    labels: chartData.employeeNames,
    datasets: [{
      label: 'Work Hour Shortfalls',
      data: chartData.workHourShortfalls,
      backgroundColor: 'rgba(255, 206, 86, 0.7)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1
    }]
  };

  const attendanceDistributionData = {
    labels: ['Present', 'Absent', 'Half-day', 'OFF'],
    datasets: [{
      data: [
        chartData.attendanceDistribution.present,
        chartData.attendanceDistribution.absent,
        chartData.attendanceDistribution.halfDay,
        chartData.attendanceDistribution.off
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(201, 203, 207, 0.7)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Attendance Visualizations</h2>
              <p className="text-sm text-gray-600 mt-1">Interactive charts and analytics for attendance patterns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Standard Charts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Late Arrivals Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-gray-900">Late Arrivals by Employee</h3>
              </div>
              <div className="h-64">
                <Bar data={lateArrivalsChartData} options={chartOptions} />
              </div>
            </div>

            {/* Early Departures Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-appRed" />
                <h3 className="font-medium text-gray-900">Early Departures by Employee</h3>
              </div>
              <div className="h-64">
                <Bar data={earlyDeparturesChartData} options={chartOptions} />
              </div>
            </div>

            {/* Work Hour Shortfalls Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium text-gray-900">Work Hour Shortfalls</h3>
              </div>
              <div className="h-64">
                <Bar data={workHoursChartData} options={chartOptions} />
              </div>
            </div>

            {/* Attendance Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-900">Attendance Status Distribution</h3>
              </div>
              <div className="h-64">
                <Doughnut data={attendanceDistributionData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Metrics</h3>
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-appRed" />
              <h3 className="font-medium text-gray-900">Policy-Based Metrics</h3>
            </div>
            <p className="text-sm text-gray-600">
              These metrics are calculated based on the actual policy flags applied to the attendance data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Policy Metrics Cards */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{policyMetrics.lateArrivals}</div>
              <div className="text-sm font-medium text-gray-700">Late Arrivals</div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">{policyMetrics.earlyDepartures}</div>
              <div className="text-sm font-medium text-gray-700">Early Departures</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{policyMetrics.shortfalls}</div>
              <div className="text-sm font-medium text-gray-700">Work Hour Shortfalls</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-appRed mb-2">{policyMetrics.overtime}</div>
              <div className="text-sm font-medium text-gray-700">Overtime Instances</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{policyMetrics.holidayWork}</div>
              <div className="text-sm font-medium text-gray-700">Holiday Work</div>
            </div>
            
            <div className="bg-rose-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-rose-600 mb-2">{policyMetrics.policyViolations}</div>
              <div className="text-sm font-medium text-gray-700">Total Policy Violations</div>
            </div>
          </div>
          
          {/* Policy Metrics Chart */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-medium text-gray-900">Policy Violations Summary</h3>
            </div>
            <div className="h-64 chart-container">
            <Bar 
              ref={(ref) => {
                if (ref) {
                  // Store the chart instance in our refs array
                  const chartIndex = chartRefs.current.findIndex(chart => chart === ref);
                  if (chartIndex === -1) {
                    chartRefs.current.push(ref);
                  } else {
                    chartRefs.current[chartIndex] = ref;
                  }
                }
              }}
              data={{
                  labels: ['Late Arrivals', 'Early Departures', 'Work Hour Shortfalls', 'Overtime', 'Holiday Work'],
                  datasets: [
                    {
                      label: 'Count',
                      data: [
                        policyMetrics.lateArrivals,
                        policyMetrics.earlyDepartures,
                        policyMetrics.shortfalls,
                        policyMetrics.overtime,
                        policyMetrics.holidayWork
                      ],
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',   // red-500
                        'rgba(245, 158, 11, 0.7)',  // amber-500
                        'rgba(168, 85, 247, 0.7)',  // purple-500
                        'rgba(59, 130, 246, 0.7)',  // blue-500
                        'rgba(249, 115, 22, 0.7)',  // orange-500
                      ],
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};