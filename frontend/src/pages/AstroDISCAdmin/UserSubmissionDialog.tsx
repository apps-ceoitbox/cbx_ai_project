
import { motion } from "framer-motion";
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
import { formatTime12Hour } from "@/components/Custom/customFunctions";


const UserSubmissionDialog = ({ submission }) => {
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
                    <span className="text-brand-red">{submission?.generatedContent?.personalityDetails?.title}</span>
                </motion.h1>

                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-2 mb-4"
                >
                    {submission?.generatedContent?.personalityDetails?.keywords?.map((keyword, index) => (
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
                    Your AstroDISC assessment for {submission?.fullName}
                </motion.p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger
                        value="profile"
                        className="flex items-center justify-center py-2 text-black bg-white border border-gray-300 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
                        Personality Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="work"
                        className="flex items-center justify-center py-2 text-black bg-white border border-gray-300 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
                        Work Style
                    </TabsTrigger>
                    <TabsTrigger
                        value="astro"
                        className="flex items-center justify-center py-2 text-black bg-white border border-gray-300 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
                        Astrological Insights
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your DISC Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={submission?.generatedContent?.chartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="name" width={140} />
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
                                    As a <span className="font-medium text-brand-red">{submission?.generatedContent?.personalityDetails?.title}</span>,
                                    you excel in environments that value your
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "D" && " directness and ability to achieve results."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "I" && " enthusiasm and people-focused approach."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "S" && " reliability and supportive nature."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "C" && " precision and analytical thinking."}
                                </p>
                                <p>
                                    Your profile shows a primary {submission?.generatedContent?.personalityDetails?.primaryType} style, with supporting elements of
                                    {submission.d > 0 && submission?.generatedContent?.personalityDetails?.primaryType !== "D" ? " Dominance," : ""}
                                    {submission.i > 0 && submission?.generatedContent?.personalityDetails?.primaryType !== "I" ? " Influence," : ""}
                                    {submission.s > 0 && submission?.generatedContent?.personalityDetails?.primaryType !== "S" ? " Steadiness," : ""}
                                    {submission.c > 0 && submission?.generatedContent?.personalityDetails?.primaryType !== "C" ? " Conscientiousness," : ""}
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
                                    {submission?.generatedContent?.personalityDetails?.workStyle?.map((trait, index) => (
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
                                    {submission?.generatedContent?.personalityDetails?.careers?.map((career, index) => (
                                        <div key={index} className="bg-muted p-3 rounded-md">
                                            {career}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3">Workplace Recommendations</h3>
                                <p>
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "D" && "Look for roles that offer autonomy, challenges, and opportunities to lead. Environments that reward results and provide variety will keep you engaged."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "I" && "Seek collaborative environments with frequent social interaction. Roles that leverage your communication skills and offer recognition will be most fulfilling."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "S" && "Thrive in stable, harmonious workplaces with clear expectations. Team-based roles that value consistency and support will align with your strengths."}
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "C" && "Excel in structured environments with attention to quality and precision. Roles requiring analytical thinking and expertise will showcase your abilities."}
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
                                Based on your birth details:  {new Date(submission.dateOfBirth).toLocaleDateString("en-IN")} at {formatTime12Hour(submission?.timeOfBirth)} in {submission?.placeOfBirth}
                            </p>

                            <div>
                                <h3 className="text-xl font-semibold mb-3">Planetary Influences</h3>
                                <div className="space-y-3">
                                    {submission?.generatedContent?.astrologicalInsights?.map((insight, index) => (
                                        <p key={index}>{insight}</p>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3">Cosmic-Behavioral Integration</h3>
                                <p className="mb-2">
                                    Your {submission?.generatedContent?.personalityDetails?.primaryType}-type DISC profile aligns with the astrological influences in your chart, particularly:
                                </p>
                                <ul className="space-y-2">
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "D" && (
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
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "I" && (
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
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "S" && (
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
                                    {submission?.generatedContent?.personalityDetails?.primaryType === "C" && (
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


        </motion.div>
    )
}

export default UserSubmissionDialog;
