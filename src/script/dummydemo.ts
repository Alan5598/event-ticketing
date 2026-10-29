"dotenv/config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Event from "../models/event";
import Ticket from "../models/ticket";
import UnansweredQuestion from "../models/unansweredQuestion";
import AiUsage from "../models/aiUsage";


const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
    if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed in production");
    await connectDB();

    await Promise.all([
        User.deleteMany({}),
        Event.deleteMany({}),
        Ticket.deleteMany({}),
        UnansweredQuestion.deleteMany({}),
        AiUsage.deleteMany({}),
    ]);
    await Promise.all([
        User.syncIndexes(),
        Event.syncIndexes(),
        Ticket.syncIndexes(),
        UnansweredQuestion.syncIndexes(),
        AiUsage.syncIndexes(),
    ]);

    const passwordHash = await bcrypt.hash("Password123!", 10);

    const [admin, attendee, organizer] = await User.create([
        { name: "Platform Admin", email: "admin@demo.com", passwordHash, roles: ["ADMIN"] },
        { name: "Alice Attendee", email: "attendee@demo.com", passwordHash },
        {
            name: "Olivier Organizer",
            email: "organizer@demo.com",
            passwordHash,
            roles: ["ATTENDEE", "ORGANIZER"],
            organizerProfile: {
                organizationName: "Kigali Tech Meetups",
                phone: "+250788000000",
                bio: "We host tech events in Kigali.",
                becameOrganizerAt: new Date(),
            },
        },
    ]);

    const published = await Event.create({
        organizerId: organizer._id,
        title: "Kigali Tech Meetup",
        description: "An evening of talks and networking for local developers.",
        category: "tech",
        startTime: days(7),
        venue: "Kigali Convention Centre",
        capacity: 100,
        ticketsIssued: 1,
        status: "published",
        details: {
            schedule: "5:00 pm doors open, 6:00 pm talks, 8:00 pm networking",
            directionsParking: "Free parking behind the venue from 5 pm.",
            whatToBring: "Your ticket QR code and a valid ID.",
            ageLimits: "Open to everyone aged 12 and above.",
        },
        ticketTypes: [{ name: "General", price: 0 }],
        faqs: [{ question: "Is there parking?", answer: "Yes, free parking behind the venue from 5 pm." }],
    });

    await Event.create({
        organizerId: organizer._id,
        title: "New Year Music Night",
        description: "Live music to start the year.",
        category: "music",
        startTime: days(30),
        venue: "Kigali Arena",
        capacity: 200,
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: "Venue unavailable",
        ticketTypes: [{ name: "General", price: 0 }],
    });

    await Ticket.create({
        eventId: published._id,
        ticketTypeId: published.ticketTypes[0]!._id,
        userId: attendee._id,
        qrToken: crypto.randomUUID(),
    });

    await UnansweredQuestion.create({
        eventId: published._id,
        questionText: "Will there be a vegetarian food option?",
    });

    await AiUsage.create({
        visitorKey: "demo-visitor-hash",
        feature: "event_qa",
        scope: String(published._id),
        usageDate: new Date().toISOString().slice(0, 10),
        count: 1,
        expireAt: days(2),
    });

    console.log("Seed complete. Users:", admin.email, attendee.email, organizer.email);
    console.log("Password for all: Password123!");
    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});