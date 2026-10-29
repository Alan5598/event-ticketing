import express from "express";
import cors from "cors";
import helmet from "helmet";

export const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("api/health",(req,res )=> res.json({status:"ok"}));