
import { useState } from "react";
import { WelcomeScreen } from "@/components/AstroDISC/WelcomeScreen";
import { UserInfo, UserInfoForm } from "@/components/AstroDISC/UserInfoForm";
import { DiscQuiz } from "@/components/AstroDISC/DiscQuiz";
import { AnalysisLoading } from "@/components/AstroDISC/AnalysisLoading";
import { ResultsDisplay } from "@/components/AstroDISC/ResultsDisplay";
import { useAxios, useData } from "@/context/AppContext";
import Header from "./Header";

// Define app steps
enum AppStep {
  WELCOME,
  USER_INFO,
  DISC_QUIZ,
  ANALYZING,
  RESULTS
}

const Index = () => {
  const { userAuth, astroResult, setAstroResult } = useData()
  const axios = useAxios("user");
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.WELCOME);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  // const [discResults, setDiscResults] = useState<DiscResults | null>(null);

  const handleGetStarted = () => {
    setCurrentStep(AppStep.USER_INFO);
  };

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentStep(AppStep.DISC_QUIZ);
  };

  const handleQuizComplete = (results) => {
    // setDiscResults(results);

    setCurrentStep(AppStep.ANALYZING);
    axios.post("/astro/generate", {
      questions: results,
      userData: {
        ...userInfo,
        fullName: userAuth?.userName || ""
      }
    }).then(res => {
      setAstroResult(res.data.data);
      setTimeout(() => {
        setCurrentStep(AppStep.RESULTS);
      }, 2000)
    })
  };

  const handleRestart = () => {
    setCurrentStep(AppStep.WELCOME);
    setUserInfo(null);
  };


  return (
    <div>
      <Header />
      <div className="min-h-screen flex flex-col cosmic-bg">
        <main className="flex-1 py-4">
          {currentStep === AppStep.WELCOME && (
            <WelcomeScreen onGetStarted={handleGetStarted} />
          )}

          {currentStep === AppStep.USER_INFO && (
            <UserInfoForm onSubmit={handleUserInfoSubmit} setCurrentStep={setCurrentStep} />
          )}

          {currentStep === AppStep.DISC_QUIZ && (
            <DiscQuiz onComplete={handleQuizComplete} />
          )}

          {currentStep === AppStep.ANALYZING && (
            <AnalysisLoading onComplete={() => { }} />
          )}

          {currentStep === AppStep.RESULTS && userInfo && astroResult && (
            <ResultsDisplay
              userInfo={userInfo}
              onRestart={handleRestart}
            />
          )}
        </main>


      </div>
    </div>
  );
};

export default Index;
