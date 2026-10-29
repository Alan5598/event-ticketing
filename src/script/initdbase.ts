import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Event from "../models/event";
import Ticket from "../models/ticket";
import UnansweredQuestion from "../models/unansweredQuestion";
import AiUsage from "../models/aiUsage";


async function init() {
    await connectDB();
    for (const model of [User, Event, Ticket, UnansweredQuestion, AiUsage]) {
        await model.createCollection();
        await model.syncIndexes();
        console.log("Ready:", model.collection.name);
    }
    await mongoose.disconnect();
}

init().catch((err) => {
    console.error(err);
   process.exit(1);
});