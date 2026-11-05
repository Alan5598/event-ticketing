import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { connectDB } from "./config/db";
import { setupSwagger } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.route";
import organizerRoutes from "./routes/organizer.routes";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/organizers", organizerRoutes);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Event Ticketing API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Event Ticketing API is running...",
    docs: "/api/docs",
  });
});

app.use("/api/events", eventRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
  console.log(` Auth API ready at http://localhost:${port}/api/auth`);
  console.log(` API documentation at http://localhost:${port}/api/docs`);
  console.log(` Organizer API ready at http://localhost:${port}/api/organizers`);
});
