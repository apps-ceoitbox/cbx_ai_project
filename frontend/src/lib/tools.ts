export interface Question {
  id: string
  type: "text" | "dropdown" | "date" | "radio"
  label: string
  options?: string[]
  required?: boolean
}

// Update the Tool interface to include promptName
export interface Tool {
  id: string
  title: string
  description: string
  questions: Question[]
  apiProvider?: string
  promptName?: string
}

// Add promptName to some of the tools
export const toolsData: Record<string, Tool> = {
  "business-plan": {
    id: "business-plan",
    title: "Business Plan Generator",
    description: "Create a comprehensive business plan for your company",
    promptName: "Business Plan Creator",
    questions: [
      {
        id: "business-name",
        type: "text",
        label: "What's your business name?",
        required: true,
      },
      {
        id: "industry",
        type: "dropdown",
        label: "What industry are you in?",
        options: ["Technology", "Retail", "Healthcare", "Education", "Finance", "Manufacturing", "Other"],
        required: true,
      },
      {
        id: "target-market",
        type: "text",
        label: "Describe your target market",
        required: true,
      },
      {
        id: "business-model",
        type: "text",
        label: "Explain your business model",
        required: true,
      },
      {
        id: "competitors",
        type: "text",
        label: "Who are your main competitors?",
        required: true,
      },
    ],
    apiProvider: "ChatGPT",
  },
  "weekly-schedule": {
    id: "weekly-schedule",
    title: "Weekly Schedule Creator",
    description: "Organize your week with an AI-generated schedule",
    promptName: "Weekly Planner Pro",
    questions: [
      {
        id: "work-hours",
        type: "text",
        label: "What are your typical working hours?",
        required: true,
      },
      {
        id: "priorities",
        type: "text",
        label: "What are your top 3 priorities this week?",
        required: true,
      },
      {
        id: "meetings",
        type: "text",
        label: "How many hours do you want to allocate for meetings?",
        required: true,
      },
      {
        id: "deep-work",
        type: "text",
        label: "How many hours do you need for deep work?",
        required: true,
      },
      {
        id: "start-date",
        type: "date",
        label: "When should this schedule start?",
        required: true,
      },
    ],
    apiProvider: "Claude",
  },
  "lead-nurturing": {
    id: "lead-nurturing",
    title: "Lead Nurturing Creator",
    description: "Develop strategies to nurture and convert leads",
    questions: [
      {
        id: "business-type",
        type: "text",
        label: "What type of business do you run?",
        required: true,
      },
      {
        id: "lead-source",
        type: "dropdown",
        label: "Where do most of your leads come from?",
        options: ["Website", "Social Media", "Referrals", "Events", "Advertising", "Other"],
        required: true,
      },
      {
        id: "sales-cycle",
        type: "dropdown",
        label: "How long is your typical sales cycle?",
        options: ["Less than a week", "1-4 weeks", "1-3 months", "3-6 months", "6+ months"],
        required: true,
      },
      {
        id: "pain-points",
        type: "text",
        label: "What are the main pain points of your customers?",
        required: true,
      },
      {
        id: "follow-up",
        type: "radio",
        label: "Do you currently have a follow-up process?",
        options: ["Yes", "No"],
        required: true,
      },
    ],
    apiProvider: "Gemini",
  },
  "purpose-master": {
    id: "purpose-master",
    title: "Purpose Master",
    description: "Define and refine your business purpose and mission",
    questions: [
      {
        id: "why-business",
        type: "text",
        label: "Why did you start your business?",
        required: true,
      },
      {
        id: "customer-problem",
        type: "text",
        label: "What customer problem does your business solve?",
        required: true,
      },
      {
        id: "impact",
        type: "text",
        label: "What impact do you want your business to have?",
        required: true,
      },
      {
        id: "success-definition",
        type: "text",
        label: "How do you define success for your business?",
        required: true,
      },
      {
        id: "legacy",
        type: "text",
        label: "What legacy do you want your business to leave?",
        required: true,
      },
    ],
    apiProvider: "Grok",
  },
  "core-values": {
    id: "core-values",
    title: "Core Values Generator",
    description: "Identify and articulate your organization's core values",
    questions: [
      {
        id: "company-description",
        type: "text",
        label: "Describe your company in a few sentences",
        required: true,
      },
      {
        id: "admired-companies",
        type: "text",
        label: "Name 3 companies whose values you admire and why",
        required: true,
      },
      {
        id: "team-traits",
        type: "text",
        label: "What traits do you value most in team members?",
        required: true,
      },
      {
        id: "decision-factors",
        type: "text",
        label: "What factors guide your important decisions?",
        required: true,
      },
      {
        id: "value-count",
        type: "dropdown",
        label: "How many core values would you like to define?",
        options: ["3", "4", "5", "6", "7"],
        required: true,
      },
    ],
    apiProvider: "Mistral",
  },
}
