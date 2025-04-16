
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  setCurrentStep: (p) => void;
}

enum AppStep {
  WELCOME,
  USER_INFO,
  DISC_QUIZ,
  ANALYZING,
  RESULTS
}


export interface UserInfo {
  fullName: string;
  dateOfBirth: any;
  timeOfBirth: any;
  placeOfBirth: string;
  gender: string;
  profession: string;
}

export function UserInfoForm({ onSubmit, setCurrentStep }: UserInfoFormProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    dateOfBirth: undefined,
    timeOfBirth: { hour: "12", minute: "00" },
    placeOfBirth: "",
    gender: "",
    profession: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.dateOfBirth || !userInfo.placeOfBirth) {

      return;
    }
    onSubmit(userInfo);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div>
      <Button style={{ minWidth: "100px", color: "#ffffff", border: "none", marginLeft: "40px" }}
        className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
        variant="ghost" onClick={() => setCurrentStep(AppStep.WELCOME)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto p-6"
      >

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
          <p className="text-muted-foreground">
            Your birth details help us calculate your unique astrological profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="fullName"
                placeholder="Enter your full name"
                className="pl-10"
                value={userInfo.fullName}
                onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                required
              />
            </div>
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal pl-10 relative"
                >
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  {userInfo.dateOfBirth ? (
                    format(userInfo.dateOfBirth, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Select your birth date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={userInfo.dateOfBirth}
                  onSelect={(date) => setUserInfo({ ...userInfo, dateOfBirth: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time of Birth</Label>
            <div className="flex space-x-2">
              <Select
                value={userInfo.timeOfBirth.hour}
                onValueChange={(hour) =>
                  setUserInfo({ ...userInfo, timeOfBirth: { ...userInfo.timeOfBirth, hour } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={userInfo.timeOfBirth.minute}
                onValueChange={(minute) =>
                  setUserInfo({ ...userInfo, timeOfBirth: { ...userInfo.timeOfBirth, minute } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Place of Birth</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="placeOfBirth"
                placeholder="City, Country"
                className="pl-10"
                value={userInfo.placeOfBirth}
                onChange={(e) => setUserInfo({ ...userInfo, placeOfBirth: e.target.value })}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter the city and country where you were born</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender (Optional)</Label>
            <Select
              value={userInfo.gender}
              onValueChange={(gender) => setUserInfo({ ...userInfo, gender })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Current Profession (Optional)</Label>
            <Input
              id="profession"
              placeholder="Your current job or field"
              value={userInfo.profession}
              onChange={(e) => setUserInfo({ ...userInfo, profession: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full bg-brand-red hover:bg-opacity-90 hover:bg-red-700">Continue to Assessment</Button>
        </form>
      </motion.div>
    </div>
  );
}
