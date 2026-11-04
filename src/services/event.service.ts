import mongoose from "mongoose";
import Event from "../models/Event";

type NewEventData = {
    title: string;
    description:string;
    category:string;
    startTime:Date;
    endTime?:Date;
    venue:string;
    capacity:number;
};
export async function createEvent(organizerId: string, data: NewEventData) {
    return Event.create({
        ...data,
        organizerId: new mongoose.Types.ObjectId(organizerId),
        status:"draft",
        ticketTypes:[{name:"General",price:0}],

    });
}
// const event = await createEvent(String(req.user!.id),data);
