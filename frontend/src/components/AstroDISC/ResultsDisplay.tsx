
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DiscResults } from "./DiscQuiz";
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
import { Download, Share2 } from "lucide-react";

interface ResultsDisplayProps {
  userInfo: UserInfo;
  discResults: DiscResults;
  onRestart: () => void;
}

export function ResultsDisplay({ userInfo, discResults, onRestart }: ResultsDisplayProps) {
  // Prepare data for chart
  const chartData = [
    { name: "Dominance", value: (discResults.d / 5) * 100 },
    { name: "Influence", value: (discResults.i / 5) * 100 },
    { name: "Steadiness", value: (discResults.s / 5) * 100 },
    { name: "Conscientiousness", value: (discResults.c / 5) * 100 },
  ];

  // Define personality titles based on dominant type
  const personalityDetails = {
    "D": {
      title: "The Commander",
      keywords: ["Direct", "Decisive", "Bold", "Risk-Taker", "Results-Oriented"],
      workStyle: [
        "You prefer a fast-paced environment with direct communication",
        "You focus on achieving goals and getting results",
        "You're comfortable taking charge and making quick decisions",
        "You may become impatient with details or slower processes"
      ],
      careers: [
        "Executive Leadership",
        "Entrepreneurship",
        "Sales Management",
        "Emergency Services",
        "Project Management"
      ]
    },
    "I": {
      title: "The Influencer",
      keywords: ["Enthusiastic", "Persuasive", "Optimistic", "Collaborative", "Expressive"],
      workStyle: [
        "You thrive in social environments with frequent interaction",
        "You enjoy inspiring and motivating others",
        "You communicate expressively and build relationships easily",
        "You may prioritize relationships over tasks or details"
      ],
      careers: [
        "Public Relations",
        "Sales & Marketing",
        "Teaching",
        "Entertainment",
        "Customer Success"
      ]
    },
    "S": {
      title: "The Supporter",
      keywords: ["Reliable", "Patient", "Empathetic", "Team-oriented", "Consistent"],
      workStyle: [
        "You excel in stable environments with clear expectations",
        "You value harmony and work well collaboratively",
        "You listen well and provide thoughtful, supportive feedback",
        "You may resist sudden changes or high-pressure situations"
      ],
      careers: [
        "Human Resources",
        "Counseling",
        "Healthcare",
        "Customer Service",
        "Non-profit Work"
      ]
    },
    "C": {
      title: "The Analyst",
      keywords: ["Precise", "Analytical", "Systematic", "Detail-oriented", "Logical"],
      workStyle: [
        "You excel in structured environments with clear processes",
        "You focus on accuracy, quality, and data-driven decisions",
        "You communicate carefully and precisely",
        "You may become frustrated with disorganization or ambiguity"
      ],
      careers: [
        "Research & Analysis",
        "Finance",
        "Engineering",
        "Quality Assurance",
        "Data Science"
      ]
    }
  };

  const personalityType = personalityDetails[discResults.dominantType];

  // Simplified astrological insights based on birth data
  const getAstrologicalInsights = () => {
    // This would typically come from an astrology API
    // For now, we'll provide simplified insights based on dominant personality type
    
    const planets = {
      Sun: "Your core identity and purpose",
      Moon: "Your emotional nature and subconscious patterns",
      Mars: "Your drive, ambition and how you take action",
      Venus: "Your approach to relationships and values",
      Saturn: "Your discipline, responsibilities and life lessons"
    };
    
    const insights = [];
    
    switch(discResults.dominantType) {
      case "D":
        insights.push("Your Sun position indicates strong leadership qualities.");
        insights.push("Mars influences your direct, action-oriented approach.");
        insights.push("Saturn suggests you learn to balance control with delegation.");
        break;
      case "I":
        insights.push("Your Venus placement enhances your natural charisma.");
        insights.push("Your Sun position shows your creative expression.");
        insights.push("Mercury indicates your gift for communication and persuasion.");
        break;
      case "S":
        insights.push("Your Moon position reveals your natural empathy and patience.");
        insights.push("Venus influences your harmonious approach to relationships.");
        insights.push("Jupiter suggests growth through supportive connections.");
        break;
      case "C":
        insights.push("Your Mercury placement enhances your analytical thinking.");
        insights.push("Saturn influences your methodical, structured approach.");
        insights.push("Your Moon indicates a need for clarity in emotional matters.");
        break;
    }
    
    return insights;
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    console.log("Downloading PDF report");
  };

  const handleShare = () => {
    // In a real implementation, this would open sharing options
    console.log("Sharing results");
  };

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
          <span className="text-brand-red">{personalityType.title}</span>
        </motion.h1>
        
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          {personalityType.keywords.map((keyword, index) => (
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
          Your AstroDISC assessment for {userInfo.fullName}
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
                  As a <span className="font-medium text-brand-red">{personalityType.title}</span>, 
                  you excel in environments that value your 
                  {discResults.dominantType === "D" && " directness and ability to achieve results."}
                  {discResults.dominantType === "I" && " enthusiasm and people-focused approach."}
                  {discResults.dominantType === "S" && " reliability and supportive nature."}
                  {discResults.dominantType === "C" && " precision and analytical thinking."}
                </p>
                <p>
                  Your profile shows a primary {discResults.dominantType} style, with supporting elements of
                  {discResults.d > 0 && discResults.dominantType !== "D" ? " Dominance," : ""}
                  {discResults.i > 0 && discResults.dominantType !== "I" ? " Influence," : ""}
                  {discResults.s > 0 && discResults.dominantType !== "S" ? " Steadiness," : ""}
                  {discResults.c > 0 && discResults.dominantType !== "C" ? " Conscientiousness," : ""}
                  {" creating your unique behavioral blueprint."}
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
                  {personalityType.workStyle.map((trait, index) => (
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
                  {personalityType.careers.map((career, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      {career}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Workplace Recommendations</h3>
                <p>
                  {discResults.dominantType === "D" && "Look for roles that offer autonomy, challenges, and opportunities to lead. Environments that reward results and provide variety will keep you engaged."}
                  {discResults.dominantType === "I" && "Seek collaborative environments with frequent social interaction. Roles that leverage your communication skills and offer recognition will be most fulfilling."}
                  {discResults.dominantType === "S" && "Thrive in stable, harmonious workplaces with clear expectations. Team-based roles that value consistency and support will align with your strengths."}
                  {discResults.dominantType === "C" && "Excel in structured environments with attention to quality and precision. Roles requiring analytical thinking and expertise will showcase your abilities."}
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
                Based on your birth details: {userInfo.dateOfBirth?.toLocaleDateString()} at {userInfo.timeOfBirth.hour}:{userInfo.timeOfBirth.minute} in {userInfo.placeOfBirth}
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Planetary Influences</h3>
                <div className="space-y-3">
                  {getAstrologicalInsights().map((insight, index) => (
                    <p key={index}>{insight}</p>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Cosmic-Behavioral Integration</h3>
                <p className="mb-2">
                  Your {discResults.dominantType}-type DISC profile aligns with the astrological influences in your chart, particularly:
                </p>
                <ul className="space-y-2">
                  {discResults.dominantType === "D" && (
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
                  {discResults.dominantType === "I" && (
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
                  {discResults.dominantType === "S" && (
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
                  {discResults.dominantType === "C" && (
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
          <Button 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button 
            onClick={handleDownload}
            variant="default"
            className="bg-brand-red hover:bg-opacity-90 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
