import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import { asyncHandler } from "../utils/asyncHandler";
import AiAgentSettingsModel, {
  AstroSettingsInterface,
} from "../models/aiAgentSettings.model";

dotenv.config();

export default class AiAgentSettingsController {
  // GET: Fetch settings by ID
  static getSettingsById = asyncHandler(async (req, res) => {
    const setting = await AiAgentSettingsModel.find({});

    if (!setting) {
      res
        .status(HttpStatusCodes.NOT_FOUND)
        .json({ message: "AI Agent setting not found" });
    }

    res.status(HttpStatusCodes.OK).json({
      message: "AI Agent setting fetched successfully",
      data: setting,
    });
  });

  static saveSettings = asyncHandler(async (req, res) => {
    const data: Partial<AstroSettingsInterface> = req.body;

    const result = await AiAgentSettingsModel.findOneAndUpdate(
      { name: data?.name },
      { $set: data },
      { new: true, upsert: true }
    );

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "AI Settings created successfully", data: result });
  });
}
