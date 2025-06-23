import React, { useState } from 'react';
import { Clock, Calendar, Settings } from 'lucide-react';
import { PolicyConfig, AttendanceData } from './types';
import { MonthlyCalendar } from './MonthlyCalendar';
import { Button } from '@/components/ui/button';

interface PolicyConfigurationProps {
  config: PolicyConfig;
  onChange: (config: PolicyConfig) => void;
  onApply: () => void;
  data: AttendanceData;
  selectedMonth: number;
  selectedYear: number;
}

export const PolicyConfiguration: React.FC<PolicyConfigurationProps> = ({
  config,
  onChange,
  onApply,
  selectedMonth,
  selectedYear,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTimeChange = (field: keyof PolicyConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleNumberChange = (field: keyof PolicyConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ ...config, [field]: numValue });
    }
  };

  const handleCheckboxChange = (field: keyof PolicyConfig, checked: boolean) => {
    onChange({ ...config, [field]: checked });
  };

  const handleCustomHolidaysChange = (days: number[]) => {
    onChange({ ...config, customHolidays: days });
  };

  return (
    <div className="space-y-3">
      {/* Time Policies & Holiday Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-appRed"></div>
        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 text-appRed mr-1.5" />
          <h3 className="text-base font-medium text-gray-900">Time & Holiday Policies</h3>
        </div>
        
        <div className="space-y-3">
          {/* Time Settings */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-800 flex items-center">
              <Settings className="w-3.5 h-3.5 text-appRed mr-1" />
              Working Hours
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="checkInTime" className="block text-xs font-medium text-gray-700 mb-0.5">
                  Check-in Time
                </label>
                <input
                  type="time"
                  id="checkInTime"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-appRed/30 focus:border-appRed text-sm"
                  value={config.checkInTime || ''}
                  onChange={(e) => handleTimeChange('checkInTime', e.target.value)}
                />
                <p className="mt-0.5 text-xs text-gray-500">
                  Arrivals after this time will be flagged as late
                </p>
              </div>
              
              <div>
                <label htmlFor="checkOutTime" className="block text-xs font-medium text-gray-700 mb-0.5">
                  Check-out Time
                </label>
                <input
                  type="time"
                  id="checkOutTime"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-appRed/30 focus:border-appRed text-sm"
                  value={config.checkOutTime || ''}
                  onChange={(e) => handleTimeChange('checkOutTime', e.target.value)}
                />
                <p className="mt-0.5 text-xs text-gray-500">
                  Departures before this time will be flagged as early
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="requiredHours" className="block text-xs font-medium text-gray-700 mb-0.5">
                Required Work Hours
              </label>
              <input
                type="number"
                id="requiredHours"
                className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-appRed/30 focus:border-appRed text-sm"
                value={config.requiredHours || ''}
                onChange={(e) => handleNumberChange('requiredHours', e.target.value)}
                min="0"
                max="24"
                step="0.5"
              />
              <p className="mt-0.5 text-xs text-gray-500">
                Work hours below this threshold will be flagged as shortfall
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showWorkedHours"
                className="h-3.5 w-3.5 text-appRed focus:ring-appRed border-gray-300 rounded"
                checked={config.showWorkedHours || false}
                onChange={(e) => handleCheckboxChange('showWorkedHours', e.target.checked)}
              />
              <label htmlFor="showWorkedHours" className="ml-1.5 block text-xs text-gray-700">
                Show worked hours in report
              </label>
            </div>
          </div>
          
          {/* Holiday Settings */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-800 mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-appRed mr-1" />
              Holiday Settings
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sundayHoliday"
                  className="h-3.5 w-3.5 text-appRed focus:ring-appRed border-gray-300 rounded"
                  checked={config.sundayHoliday || false}
                  onChange={(e) => handleCheckboxChange('sundayHoliday', e.target.checked)}
                />
                <label htmlFor="sundayHoliday" className="ml-1.5 block text-xs text-gray-700">
                  Sunday is a holiday
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="secondSaturdayHoliday"
                  className="h-3.5 w-3.5 text-appRed focus:ring-appRed border-gray-300 rounded"
                  checked={config.secondSaturdayHoliday || false}
                  onChange={(e) => handleCheckboxChange('secondSaturdayHoliday', e.target.checked)}
                />
                <label htmlFor="secondSaturdayHoliday" className="ml-1.5 block text-xs text-gray-700">
                  Second Saturday is a holiday
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checkHolidays"
                  className="h-3.5 w-3.5 text-appRed focus:ring-appRed border-gray-300 rounded"
                  checked={config.checkHolidays || false}
                  onChange={(e) => handleCheckboxChange('checkHolidays', e.target.checked)}
                />
                <label htmlFor="checkHolidays" className="ml-1.5 block text-xs text-gray-700">
                  Apply policy checks on holidays
                </label>
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-1 h-7 px-1.5 py-0 text-xs"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="h-3 w-3" />
                  {showCalendar ? 'Hide Calendar' : 'Custom Holidays'}
                </Button>
              </div>
            </div>
            
            {showCalendar && (
              <div className="mt-2">
                <MonthlyCalendar
                  month={selectedMonth}
                  year={selectedYear}
                  selectedDays={config.customHolidays || []}
                  onChange={handleCustomHolidaysChange}
                  sundayHoliday={config.sundayHoliday || false}
                  secondSaturdayHoliday={config.secondSaturdayHoliday || false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Apply Button */}
      <div className="flex justify-end">
        <Button
          className="bg-appRed hover:bg-appRed/90 text-sm py-1 h-8"
          onClick={onApply}
        >
          Apply Policies
        </Button>
      </div>
    </div>
  );
};