import dotenv from "dotenv";
import { AI, ApiProvider } from "../utils/AI";
import AiSettings from "../models/ai.model";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import { DocumentSettingsInterface } from "../models/documentSettings.model";
import DocumentSettings from "../models/documentSettings.model";
import DocumentSubmission from "../models/documentSubmission.model";
dotenv.config();




export default class DocumentController {
  static saveSettings = asyncHandler(async (req, res) => {
    const data: Partial<DocumentSettingsInterface> = req.body;

    const result = await DocumentSettings.findOneAndUpdate(
      { name: "Document" }, // Filter to find the document
      { $set: data }, // Update fields
      { new: true, upsert: true } // Options: create if not found
    );

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Document Settings created successfully", data: result });
  });

  static getSettings = asyncHandler(async (req, res) => {
    const data = await DocumentSettings.findOne({ name: "Document" });
    res.send({ message: "Astro Settings fetched successfully", data: data });
  });

  static getDocumentSubmission = asyncHandler(async (req, res) => {
    const data = await DocumentSubmission.find();
    res.send({ message: "Document Submission fetched successfully", data: data });
  });

  static getDocumentUserSubmission = asyncHandler(async (req, res) => {
    const data = await DocumentSubmission.find({ email: req.user.email }).sort({createdAt:-1});
    res.send({ message: "Document Submission fetched successfully", data: data });
  });

  static processDocument = asyncHandler(async (req, res) => {
    const files: any[] = req.body.files;
    const processingOption: string = req.body.processingOption;
    const documentType: string = req.body.documentType;
    const goal: string = req.body.goal;
    const documentSettings = await DocumentSettings.findOne({ name: "Document" });
    const apiProvider = await AiSettings.findOne({ name: documentSettings?.aiProvider.name });

    const ai = new AI({
      name: apiProvider?.name as ApiProvider["name"],
      model: documentSettings?.aiProvider?.model,
      apiKey: apiProvider?.apiKey,
      temperature: apiProvider?.temperature,
      maxTokens: apiProvider?.maxTokens,
    });
    const result = await ai.processDocument(files, processingOption, documentType, goal, documentSettings.promptContent);

    const submissionData = {
      processingOption,
      files: files.map(file => file.type),
      documentType,
      goal,
      promptContent: documentSettings?.promptContent,
      aiProvider: documentSettings?.aiProvider.name,
      model: documentSettings?.aiProvider?.model,
      email: req.user.email,
      name: req.user.userName,
      result
    }
    DocumentSubmission.create(submissionData);

    res.send(result);
  })
  static processDocumentWithContext = asyncHandler(async (req, res) => {
    const files: any[] = req.body.files;
    const processingOption: string = req.body.processingOption;
    const documentType: string = req.body.documentType;
    const goal: string = req.body.goal;
    const context: { role: 'user' | 'system', content: string }[] = req.body.context || [];
    const documentSettings = await DocumentSettings.findOne({ name: "Document" });
    const apiProvider = await AiSettings.findOne({ name: documentSettings?.aiProvider.name });

    const ai = new AI({
      name: apiProvider?.name as ApiProvider["name"],
      model: documentSettings?.aiProvider?.model,
      apiKey: apiProvider?.apiKey,
      temperature: apiProvider?.temperature,
      maxTokens: apiProvider?.maxTokens,
    });
    const result = await ai.processDocument(files, processingOption, documentType, goal, documentSettings.promptContent);

    const submissionData = {
      processingOption,
      files: files.map(file => file.type),
      documentType,
      goal,
      promptContent: documentSettings?.promptContent,
      aiProvider: documentSettings?.aiProvider.name,
      model: documentSettings?.aiProvider?.model,
      email: req.user.email,
      name: req.user.userName,
      result,
      results: context
    }
    let entry = await DocumentSubmission.create(submissionData);

    res.send({result, entry});
  })

}