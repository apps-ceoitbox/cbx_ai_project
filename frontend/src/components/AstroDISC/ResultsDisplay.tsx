
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// import { DiscResults } from "./DiscQuiz";
import { UserInfo } from "./UserInfoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Download } from "lucide-react"; //Share2
import { useData } from "@/context/AppContext";
import { useRef } from "react";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js'

interface ResultsDisplayProps {
  userInfo: UserInfo;
  onRestart: () => void;
}



export function ResultsDisplay({ userInfo, onRestart }: ResultsDisplayProps) {
  const { astroResult, userAuth } = useData();
  const chartData = astroResult?.chartData || [];
  const personalityType = astroResult?.personalityDetails || {};

  const reportRef = useRef<HTMLDivElement>(null);


  const handleDownload = () => {
    if (!reportRef.current) return;

    // Configuration options for html2pdf
    const opt = {
      margin: 10,
      filename: `AstroDISC-${personalityType?.title}-Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Show loading indication (if you have a toast system)
    if (typeof toast !== 'undefined') {
      toast.loading("Generating your PDF report...");
    }

    // Generate and download the PDF
    html2pdf().from(reportRef.current).set(opt).save()
      .then(() => {
        // Success notification
        if (typeof toast !== 'undefined') {
          toast.dismiss();
          toast.success("Your PDF report has been downloaded!");
        }
        console.log("PDF downloaded successfully");
      })
      .catch(error => {
        console.error("Error generating PDF:", error);
        if (typeof toast !== 'undefined') {
          toast.dismiss();
          toast.error("Failed to generate PDF. Please try again.");
        }
      });
  };

  // const handleShare = () => {
  //   console.log("Sharing results");
  // };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-4 py-8"
    >

      <div className="text-center mb-8">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-2"
        >
          <span className="text-brand-red">{personalityType?.title}</span>
        </motion.h1>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          {personalityType?.keywords?.map((keyword, index) => (
            <span
              key={index}
              className="bg-secondary px-3 py-1 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground"
        >
          Your AstroDISC assessment for {userAuth?.user?.userName}
        </motion.p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile">Personality Profile</TabsTrigger>
          <TabsTrigger value="work">Work Style</TabsTrigger>
          <TabsTrigger value="astro">Astrological Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your DISC Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#E63946"
                      radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (value) => `${Math.round(value)}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Profile Overview</h3>
                <p>
                  As a <span className="font-medium text-brand-red">{personalityType?.title}</span>,
                  you excel in environments that value your
                  {astroResult.primaryType === "D" && " directness and ability to achieve results."}
                  {astroResult.primaryType === "I" && " enthusiasm and people-focused approach."}
                  {astroResult.primaryType === "S" && " reliability and supportive nature."}
                  {astroResult.primaryType === "C" && " precision and analytical thinking."}
                </p>
                <p>
                  Your profile shows a primary {astroResult?.personalityDetails?.primaryType} style, with supporting elements of
                  {astroResult.d > 0 && astroResult.personalityDetails.primaryType !== "D" ? " Dominance," : ""}
                  {astroResult.i > 0 && astroResult.personalityDetails.primaryType !== "I" ? " Influence," : ""}
                  {astroResult.s > 0 && astroResult.personalityDetails.primaryType !== "S" ? " Steadiness," : ""}
                  {astroResult.c > 0 && astroResult.personalityDetails.primaryType !== "C" ? " Conscientiousness," : ""}
                  {"creating your unique behavioral blueprint."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Style & Career Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Your Natural Work Style</h3>
                <ul className="space-y-2">
                  {personalityType?.workStyle?.map((trait, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-brand-red mt-1">•</span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Suggested Career Paths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {personalityType?.careers?.map((career, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      {career}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Workplace Recommendations</h3>
                <p>
                  {astroResult?.personalityDetails?.primaryType === "D" && "Look for roles that offer autonomy, challenges, and opportunities to lead. Environments that reward results and provide variety will keep you engaged."}
                  {astroResult?.personalityDetails?.primaryType === "I" && "Seek collaborative environments with frequent social interaction. Roles that leverage your communication skills and offer recognition will be most fulfilling."}
                  {astroResult?.personalityDetails?.primaryType === "S" && "Thrive in stable, harmonious workplaces with clear expectations. Team-based roles that value consistency and support will align with your strengths."}
                  {astroResult?.personalityDetails?.primaryType === "C" && "Excel in structured environments with attention to quality and precision. Roles requiring analytical thinking and expertise will showcase your abilities."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="astro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vedic Astrological Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Based on your birth details: {userInfo?.dateOfBirth?.toLocaleDateString()} at {userInfo?.timeOfBirth?.hour}:{userInfo?.timeOfBirth?.minute} in {userInfo?.placeOfBirth}
              </p>

              <div>
                <h3 className="text-xl font-semibold mb-3">Planetary Influences</h3>
                <div className="space-y-3">
                  {astroResult?.astrologicalInsights?.map((insight, index) => (
                    <p key={index}>{insight}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Cosmic-Behavioral Integration</h3>
                <p className="mb-2">
                  Your {astroResult.personalityDetails?.primaryType}-type DISC profile aligns with the astrological influences in your chart, particularly:
                </p>
                <ul className="space-y-2">
                  {astroResult?.personalityDetails?.primaryType === "D" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Strong Mars placement reinforcing your direct, action-oriented approach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Sun in a position of authority and leadership</span>
                      </li>
                    </>
                  )}
                  {astroResult?.personalityDetails?.primaryType === "I" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Venus placement enhancing your social and persuasive abilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Mercury supporting your expressive communication style</span>
                      </li>
                    </>
                  )}
                  {astroResult?.personalityDetails?.primaryType === "S" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Moon in a position enhancing emotional stability and empathy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Venus supporting your harmonious relationship approach</span>
                      </li>
                    </>
                  )}
                  {astroResult?.personalityDetails?.primaryType === "C" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Mercury placement enhancing your analytical and precise thinking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-red mt-1">•</span>
                        <span>Saturn supporting your methodical and structured approach</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm">
                  <strong>Note:</strong> This is a simplified interpretation. For a comprehensive Vedic astrology reading,
                  we recommend consulting with a professional astrologer who can provide detailed analysis
                  of your full birth chart.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={onRestart}
          className="order-2 sm:order-1"
        >
          Start New Assessment
        </Button>

        <div className="flex gap-2 order-1 sm:order-2">
          {/* <Button
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button> */}

          <Button
            onClick={handleDownload}
            variant="default"
            className="bg-brand-red hover:bg-red-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

    </motion.div>
  );
}
