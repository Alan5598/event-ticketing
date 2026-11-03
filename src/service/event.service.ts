import Event from "../models/Event";

type NewEventData = {
    title: String;
    description:String;
    category:String;
    startTime:Date;
    endTime?:Date;
    venue:String;
    capacity:number;
};
export async function createEvent(organizerId: String,data:NewEventData) {
    return Event.create({
        ...data,
        organizerId,
        status:"draft",
        ticketTypes:[{name:"General",price:0}],

    });
}
