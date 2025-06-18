// Script to add Report Agent AI to the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB with increased timeout
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define the schema (simplified version of the actual schema)
const AiAgentSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, default: "AI agents" },
    aiProvider: { type: { name: String, model: String } },
    apikey: { type: String },
    promptContent: { type: String },
    visibility: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create the model
const AiAgentSettingsModel = mongoose.model('AiAgentSettings', AiAgentSettingsSchema);

// Data for the new Report Agent AI
const reportAgentData = {
  name: "ReportAgent",
  aiProvider: {
    name: "OpenAI",
    model: "gpt-4"
  },
  apikey: "your-api-key-here", // Replace with actual API key if needed
  promptContent: "Upload CSV or PDF or Google Sheet link to get analysis",
  visibility: true
};

// Function to add the Report Agent AI
async function addReportAgentAI() {
  try {
    console.log('Attempting to find existing Report Agent...');
    // Check if it already exists
    const existingAgent = await AiAgentSettingsModel.findOne({ name: reportAgentData.name });
    
    if (existingAgent) {
      console.log('Found existing Report Agent, updating visibility...');
      // Update visibility if it exists
      existingAgent.visibility = true;
      await existingAgent.save();
      console.log('Report Agent AI visibility updated successfully');
    } else {
      console.log('No existing Report Agent found, creating new one...');
      // Create new if it doesn't exist
      const newAgent = new AiAgentSettingsModel(reportAgentData);
      await newAgent.save();
      console.log('Report Agent AI added successfully');
    }
    
    // Disconnect from MongoDB
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB due to error');
  }
}

// Run the function
addReportAgentAI();