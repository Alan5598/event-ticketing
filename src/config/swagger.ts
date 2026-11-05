import { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const sourceExtension = path.extname(__filename);
const routesDirectory = path.resolve(__dirname, "../routes");
const routes = fs
  .readdirSync(routesDirectory)
  .filter((file) => file.endsWith(sourceExtension))
  .map((file) => path.join(routesDirectory, file));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "EventQ API",
      version: "1.0.0",
      description: "API documentation for the EventQ ticketing backend.",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [...routes, path.resolve(__dirname, `../server${sourceExtension}`)],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });
};
