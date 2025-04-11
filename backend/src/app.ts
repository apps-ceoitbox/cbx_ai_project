import express, { Application } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.config";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export default app;


