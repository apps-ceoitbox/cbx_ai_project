import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, Calendar, Users, Minimize2, Maximize2, Database, Shield } from 'lucide-react';
import { AttendanceData, AttendanceRecord, PolicyConfig } from './types';

interface DataPreviewProps {
  data: AttendanceData;
  selectedMonth: number;
  selectedYear: number;
  policyConfig: PolicyConfig;
  policiesApplied?: boolean;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  selectedMonth,
  selectedYear,
  policyConfig,
  policiesApplied = false,
}) => {
  const [] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  // Default to 'raw' view mode, will switch to 'policy' when policies are applied
  const [viewMode, setViewMode] = useState<'raw' | 'policy'>('raw');
  
  // Update viewMode when policies are applied
  useEffect(() => {
    if (policiesApplied) {
      setViewMode('policy');
    }
  }, [policiesApplied]);

  // Calculate days in month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  // Get day information (name, if Sunday or Second Saturday)
  const getDayInfo = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isSunday = date.getDay() === 0;
    const isSecondSaturday = date.getDay() === 6 && Math.floor((day - 1) / 7) === 1;
    
    return { dayName, isSunday, isSecondSaturday };
  };

  // Apply policy checks to generate attendance flags
  const applyPolicyChecks = (record: AttendanceRecord): AttendanceRecord => {
    const updatedRecord = { ...record };
    
    updatedRecord.dailyRecords = record.dailyRecords.map(dailyRecord => {
      const { day, checkIn, checkOut, isOff, isAbsent, isHalfDay } = dailyRecord;
      const flags: string[] = []; // Change from AttendanceFlag[] to string[]
      
      // Skip policy checks for off days, absents, or half days
      if (isOff || isAbsent || isHalfDay) {
        return dailyRecord;
      }
      
      const dayInfo = getDayInfo(day);
      const isHoliday = (policyConfig.sundayHoliday && dayInfo.isSunday) || 
                       (policyConfig.secondSaturdayHoliday && dayInfo.isSecondSaturday) ||
                       (policyConfig.customHolidays?.includes(day) || false);
      
      // Skip policy checks for holidays unless explicitly configured to check
      if (isHoliday && !policyConfig.checkHolidays) {
        return { ...dailyRecord, isHoliday };
      }
      
      // Check for late arrival
      if (checkIn && policyConfig.checkInTime) {
        const checkInTime = new Date(`2000-01-01T${checkIn}`);
        const policyCheckInTime = new Date(`2000-01-01T${policyConfig.checkInTime}`);
        
        if (checkInTime > policyCheckInTime) {
          flags.push('late-arrival');
        }
      }
      
      // Check for early departure
      if (checkOut && policyConfig.checkOutTime) {
        const checkOutTime = new Date(`2000-01-01T${checkOut}`);
        const policyCheckOutTime = new Date(`2000-01-01T${policyConfig.checkOutTime}`);
        
        if (checkOutTime < policyCheckOutTime) {
          flags.push('early-departure');
        }
      }
      
      // Check for work hour shortfall
      if (checkIn && checkOut && policyConfig.requiredHours) {
        const checkInTime = new Date(`2000-01-01T${checkIn}`);
        const checkOutTime = new Date(`2000-01-01T${checkOut}`);
        
        // Calculate hours worked
        const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const minutesWorked = Math.round(hoursWorked * 60);
        
        // Add workDuration to the daily record
        dailyRecord.workDuration = minutesWorked;
        
        if (hoursWorked < policyConfig.requiredHours) {
          flags.push('shortfall');
        } else if (hoursWorked > policyConfig.requiredHours + 2) { // 2 hours overtime threshold
          flags.push('overtime');
        }
      }
      
      // Check for holiday work
      if (isHoliday && checkIn && checkOut) {
        flags.push('holiday-work');
      }
      
      return { ...dailyRecord, flags, isHoliday };
    });
    
    return updatedRecord;
  };

  // Apply policy checks to all records
  const processedRecords = useMemo(() => {
    return data.records.map(applyPolicyChecks);
  }, [data.records, policyConfig]);

  // Filter records based on search text
  const filteredRecords = useMemo(() => {
    if (!filterText) return processedRecords;
    
    const searchTerm = filterText.toLowerCase();
    return processedRecords.filter(
      record => 
        record.employeeId.toLowerCase().includes(searchTerm) ||
        record.name.toLowerCase().includes(searchTerm)
    );
  }, [processedRecords, filterText]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'id') {
        comparison = a.employeeId.localeCompare(b.employeeId);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortBy, sortDirection]);

  // Handle sort change
  const handleSort = (field: 'id' | 'name') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Get flag color class
  const getFlagColorClass = (flag: string) => { // Change parameter type to string
    switch (flag) {
      case 'late-arrival':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'early-departure':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shortfall':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'overtime':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'holiday-work':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get flag label
  const getFlagLabel = (flag: string) => { // Change parameter type to string
    switch (flag) {
      case 'late-arrival':
        return 'Late';
      case 'early-departure':
        return 'Early';
      case 'shortfall':
        return 'Short';
      case 'overtime':
        return 'OT';
      case 'holiday-work':
        return 'Holiday';
      default:
        return flag;
    }
  };

  // Get cell background class based on attendance status
  const getCellBackgroundClass = (record: AttendanceRecord, day: number) => {
    const dailyRecord = record.dailyRecords.find(dr => dr.day === day);
    
    if (!dailyRecord) return 'bg-gray-50';
    
    if (dailyRecord.isOff) return 'bg-gray-100';
    if (dailyRecord.isAbsent) return 'bg-red-50';
    if (dailyRecord.isHalfDay) return 'bg-amber-50';
    if (dailyRecord.isHoliday) return 'bg-red-50';
    
    return 'bg-white';
  };

  return (
    <div className="space-y-4">
      {/* Header with month/year and employee count */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-appRed" />
          <h3 className="text-lg font-medium text-gray-900">
            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} {selectedYear}
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-appRed" />
            <span className="text-sm text-gray-600">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'Employee' : 'Employees'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center space-x-1 text-sm text-appRed hover:text-red-700 focus:outline-none transition-colors duration-200 px-2 py-1 rounded hover:bg-red-50"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              title={isTableExpanded ? "Collapse Table" : "Expand Table"}
            >
              {isTableExpanded ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span>Expand</span>
                </>
              )}
            </button>
            
            <div className="flex items-center border rounded overflow-hidden">
              <button
                className={`flex items-center space-x-1 text-xs px-2 py-1 transition-colors duration-200 ${viewMode === 'raw' ? 'bg-red-100 text-red-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setViewMode('raw')}
                title="Show Raw Data"
              >
                <Database className="h-3 w-3" />
                <span>Raw Data</span>
              </button>
              <button
                className={`flex items-center space-x-1 text-xs px-2 py-1 transition-colors duration-200 ${viewMode === 'policy' ? 'bg-red-100 text-red-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setViewMode('policy')}
                title="Show Applied Policies"
                disabled={!policiesApplied}
              >
                <Shield className="h-3 w-3" />
                <span>{policiesApplied ? "Applied Policies" : "Policies Not Applied"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by employee ID or name"
          className="pl-10 w-full border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-2 focus:ring-appRed focus:border-appRed"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      
      {/* Table section */}
      
      {/* Data table */}
      <div className={`overflow-x-auto transition-all duration-300 ${isTableExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Employee ID</span>
                  {sortBy === 'id' && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortBy === 'name' && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayInfo = getDayInfo(day);
                const isHoliday = (policyConfig.sundayHoliday && dayInfo.isSunday) || 
                               (policyConfig.secondSaturdayHoliday && dayInfo.isSecondSaturday) ||
                               (policyConfig.customHolidays?.includes(day) || false);
                
                return (
                  <th 
                    key={day} 
                    scope="col" 
                    className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider ${isHoliday ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-appRed font-medium">{day}</span>
                      <span className="text-xs text-red-500">{dayInfo.dayName}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.map((record) => (
              <tr key={record.employeeId}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.employeeId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {record.name}
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dailyRecord = record.dailyRecords.find(dr => dr.day === day);
                  
                  if (!dailyRecord) {
                    return (
                      <td key={day} className="px-2 py-3 text-center text-xs text-gray-500 bg-gray-50">
                        -
                      </td>
                    );
                  }
                  
                  const { checkIn, checkOut, isOff, isAbsent, isHalfDay, flags } = dailyRecord;
                  
                  return (
                    <td 
                      key={day} 
                      className={`px-2 py-3 text-center text-xs ${getCellBackgroundClass(record, day)}`}
                    >
                      {isOff ? (
                        <span className="text-gray-500">OFF</span>
                      ) : isAbsent ? (
                        <span className="text-red-500">A</span>
                      ) : isHalfDay ? (
                        <span className="text-amber-500">HD</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex flex-col">
                            <span className="text-gray-700">{checkIn || '-'}</span>
                            <span className="text-gray-700">{checkOut || '-'}</span>
                            {((viewMode === 'raw') || (viewMode === 'policy' && policyConfig.showWorkedHours)) && 
                              checkIn && checkOut && dailyRecord.workDuration !== undefined && (
                              <span className="text-gray-700 font-medium">
                                {Math.floor(dailyRecord.workDuration / 60)}h {dailyRecord.workDuration % 60}m
                              </span>
                            )}
                          </div>
                          
                          {viewMode === 'policy' && flags && flags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {flags.map((flag, index) => (
                                <span 
                                  key={index} 
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] border ${getFlagColorClass(flag)}`}
                                >
                                  {getFlagLabel(flag)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={2 + daysInMonth} className="px-4 py-8 text-center text-sm text-gray-500">
                  No employees found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};