import { ProcessingOptionType } from "@/components/DocumentReader/ProcessingOptions";

export async function processDocument(
    files: File[],
    processingOption: ProcessingOptionType,
    documentType: string,
    goal: string,
    onProgress: (progress: number) => void
): Promise<any> {
    return new Promise((resolve, reject) => {
        // Simulate processing delay with progress updates
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            onProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);

                // Generate mock results based on the processing option
                const results = generateMockResults(processingOption);
                setTimeout(() => resolve(results), 500); // small delay after reaching 100%
            }
        }, 500);

        // Add small chance of error for testing purposes
        if (Math.random() < 0.05) {
            clearInterval(interval);
            setTimeout(() => reject(new Error("Error processing document. Please try again.")), 2000);
        }
    });
}

function generateMockResults(processingOption: ProcessingOptionType) {
    switch (processingOption) {
        case "summarize":
            return {
                summary: "This business proposal outlines a new market expansion strategy for Q3 2023. It proposes entering the European market with our flagship product, targeting primarily Germany and France. The plan includes a phased rollout over 12 months with an initial investment of $1.2M.\n\nThe proposal highlights three key differentiators from competitors and projects a 22% ROI within 18 months. Market analysis indicates a potential market share of 5-7% by end of year 2, with break-even expected in Q4 2024.\n\nNotable risks include regulatory hurdles in the EU and potential supply chain disruptions. Mitigation strategies are included but would benefit from more detailed contingency planning.",
            };

        case "questions":
            return {
                questions: [
                    {
                        question: "What are the risks mentioned in the document?",
                        answer: "The proposal identifies several key risks: 1) Regulatory challenges in the EU market, particularly around product certification; 2) Potential supply chain disruptions affecting timely market entry; 3) Competitive response from established European players; 4) Currency fluctuation risks affecting projected margins; 5) Slower than anticipated customer adoption rates.",
                    },
                    {
                        question: "How can we make this proposal stronger?",
                        answer: "The proposal could be strengthened by: 1) Including more detailed contingency plans for the identified risks; 2) Providing case studies of similar market entries; 3) Adding more specific customer acquisition strategies; 4) Elaborating on the competitive landscape with a SWOT analysis; 5) Including testimonials from existing clients in similar markets; 6) Providing more granular financial projections with sensitivity analysis.",
                    },
                ],
            };

        case "insights":
            return {
                insights: {
                    keyTakeaways: [
                        "European market entry proposed for Q3 2023 with $1.2M initial investment",
                        "Phased rollout targeting Germany and France first",
                        "22% projected ROI within 18 months",
                        "5-7% potential market share by end of year 2",
                        "Break-even expected in Q4 2024"
                    ],
                    strengths: [
                        "Comprehensive market analysis with solid data sources",
                        "Clear timeline with defined milestones",
                        "Realistic financial projections with supporting evidence",
                        "Strong competitive differentiation outlined",
                        "Detailed marketing strategy aligned with target demographics"
                    ],
                    gaps: [
                        "Limited contingency planning for identified risks",
                        "Insufficient details on local partnership strategy",
                        "No clear metrics for measuring early success",
                        "Limited analysis of cultural adaptation needs",
                        "Regulatory compliance section needs more depth"
                    ],
                    actionPoints: [
                        "Develop detailed risk mitigation strategies, especially for regulatory challenges",
                        "Establish clear KPIs for the first 90 days post-launch",
                        "Research and propose potential local partners in target markets",
                        "Conduct competitive landscape analysis with positioning map",
                        "Create a more detailed timeline for regulatory approval process"
                    ]
                },
            };

        case "report":
            return {
                reportUrl: "#", // In a real implementation, this would be a URL to download the report
                insights: {
                    keyTakeaways: [
                        "European market entry proposed for Q3 2023 with $1.2M initial investment",
                        "Phased rollout targeting Germany and France first",
                        "22% projected ROI within 18 months",
                        "5-7% potential market share by end of year 2",
                        "Break-even expected in Q4 2024"
                    ],
                    strengths: [
                        "Comprehensive market analysis with solid data sources",
                        "Clear timeline with defined milestones",
                        "Realistic financial projections with supporting evidence",
                        "Strong competitive differentiation outlined",
                        "Detailed marketing strategy aligned with target demographics"
                    ],
                    gaps: [
                        "Limited contingency planning for identified risks",
                        "Insufficient details on local partnership strategy",
                        "No clear metrics for measuring early success",
                        "Limited analysis of cultural adaptation needs",
                        "Regulatory compliance section needs more depth"
                    ],
                    actionPoints: [
                        "Develop detailed risk mitigation strategies, especially for regulatory challenges",
                        "Establish clear KPIs for the first 90 days post-launch",
                        "Research and propose potential local partners in target markets",
                        "Conduct competitive landscape analysis with positioning map",
                        "Create a more detailed timeline for regulatory approval process"
                    ]
                },
            };

        default:
            return {};
    }
}
