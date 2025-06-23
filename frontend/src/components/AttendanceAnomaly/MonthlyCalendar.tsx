import React from 'react';

interface MonthlyCalendarProps {
  month: number;
  year: number;
  selectedDays: number[];
  onChange: (days: number[]) => void;
  sundayHoliday: boolean;
  secondSaturdayHoliday: boolean;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  month,
  year,
  selectedDays,
  onChange,
  sundayHoliday,
  secondSaturdayHoliday,
}) => {
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Create calendar days array
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Check if a day is a Sunday
  const isSunday = (day: number) => {
    return new Date(year, month, day).getDay() === 0;
  };
  
  // Check if a day is a second Saturday
  const isSecondSaturday = (day: number) => {
    const date = new Date(year, month, day);
    return date.getDay() === 6 && Math.floor((day - 1) / 7) === 1;
  };
  
  // Toggle day selection
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };
  
  // Get day class based on selection state and day type
  const getDayClass = (day: number) => {
    const isSelected = selectedDays.includes(day);
    const dayIsSunday = isSunday(day);
    const dayIsSecondSaturday = isSecondSaturday(day);
    const isAutoHoliday = (sundayHoliday && dayIsSunday) || (secondSaturdayHoliday && dayIsSecondSaturday);
    
    let baseClass = 'flex items-center justify-center h-8 w-8 rounded-full text-sm cursor-pointer';
    
    if (isSelected) {
      return `${baseClass} bg-appRed text-white hover:bg-appRed/90`;
    } else if (isAutoHoliday) {
      return `${baseClass} bg-red-100 text-red-800 hover:bg-red-200`;
    } else {
      return `${baseClass} hover:bg-gray-100`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-900">
          {new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Click on dates to select custom holidays
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="text-center py-1">
            {day !== null ? (
              <div
                className={getDayClass(day)}
                onClick={() => toggleDay(day)}
              >
                {day}
              </div>
            ) : (
              <div className="h-8 w-8"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-100 border border-red-200 mr-1"></div>
            <span>Auto Holiday</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-appRed mr-1"></div>
            <span>Custom Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
};