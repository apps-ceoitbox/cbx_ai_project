
import { useState } from "react";
import { WelcomeScreen } from "@/components/AstroDISC/WelcomeScreen";
import { UserInfoForm } from "@/components/AstroDISC/UserInfoForm";
import { DiscQuiz } from "@/components/AstroDISC/DiscQuiz";
import { AnalysisLoading } from "@/components/AstroDISC/AnalysisLoading";
import { ResultsDisplay } from "@/components/AstroDISC/ResultsDisplay";

// Define app steps
enum AppStep {
  WELCOME,
  USER_INFO,
  DISC_QUIZ,
  ANALYZING,
  RESULTS
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.WELCOME);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [discResults, setDiscResults] = useState<DiscResults | null>(null);

  const handleGetStarted = () => {
    setCurrentStep(AppStep.USER_INFO);
  };

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentStep(AppStep.DISC_QUIZ);
  };

  const handleQuizComplete = (results: DiscResults) => {
    setDiscResults(results);
    setCurrentStep(AppStep.ANALYZING);
  };

  const handleAnalysisComplete = () => {
    setCurrentStep(AppStep.RESULTS);
  };

  const handleRestart = () => {
    setCurrentStep(AppStep.WELCOME);
    setUserInfo(null);
    setDiscResults(null);
  };

  return (
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
          <AnalysisLoading onComplete={handleAnalysisComplete} />
        )}

        {currentStep === AppStep.RESULTS && userInfo && discResults && (
          <ResultsDisplay
            userInfo={userInfo}
            discResults={discResults}
            onRestart={handleRestart}
          />
        )}
      </main>


    </div>
  );
};

export default Index;
