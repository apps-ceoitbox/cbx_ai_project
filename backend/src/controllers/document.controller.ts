import dotenv from "dotenv";
import { AI, ApiProvider } from "../utils/AI";
import AiSettings from "../models/ai.model";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();




export default class DocumentController {

  static processDocument = asyncHandler(async (req, res) => {
    const files: any[] = req.body.files;
    const processingOption: string = req.body.processingOption;
    const documentType: string = req.body.documentType;
    const goal: string = req.body.goal;
    const apiProvider = await AiSettings.findOne({ name: "Gemini (Google)" });
    const ai = new AI({
      name: apiProvider?.name as ApiProvider["name"],
      model: apiProvider?.model,
      apiKey: apiProvider?.apiKey,
      temperature: apiProvider?.temperature,
      maxTokens: apiProvider?.maxTokens,
    });
    const result = await ai.processDocument(files, processingOption, documentType, goal);
    console.log({result});
    res.send(result);
  })

}

