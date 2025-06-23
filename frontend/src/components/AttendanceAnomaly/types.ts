export interface AttendanceRecord {
  employeeId: string;
  name: string;
  dailyRecords: DailyRecord[];
}

export interface DailyRecord {
  isHoliday: any;
  day: number;
  checkIn: string | null;
  checkOut: string | null;
  isOff: boolean;
  isAbsent: boolean;
  isHalfDay: boolean;
  workDuration?: number; // in minutes
  flags?: string[];
}

export interface AttendanceFlag {
  type: 'late_arrival' | 'early_departure' | 'shortfall' | 'overtime' | 'policy_violation';
  message: string;
  severity: 'low' | 'medium' | 'high';
  color: string;
}

export interface AttendanceData {
  headers: string[];
  records: AttendanceRecord[];
  month: number;
  year: number;
}

export interface PolicyConfig {
  checkInTime: string;
  checkOutTime: string;
  requiredHours: number;
  secondSaturdayHoliday: boolean;
  sundayHoliday: boolean;
  showWorkedHours: boolean;
  customHolidays: number[];
  checkHolidays?: boolean;
}

export interface AnalysisResult {
  summary: string;
  anomalies: Anomaly[];
  statistics: AttendanceStatistics;
  recommendations: string[];
  criticalFindings?: string[];
  moderateConcerns?: string[];
  positivePatterns?: string[];
}

export interface Anomaly {
  name: string;
  employeeId: string;
  employeeName: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  frequency: number;
  affectedDays: number[];
}

export interface AttendanceStatistics {
  earlyDeparturePercentage: number;
  lateArrivalPercentage: number;
  averageAttendance: number;
  totalEmployees: number;
  totalWorkingDays: number;
  averageAttendanceRate: number;
  lateArrivals: number;
  earlyDepartures: number;
  workHourShortfalls: number;
  policyViolations: number;
  holidayWork: number;
}