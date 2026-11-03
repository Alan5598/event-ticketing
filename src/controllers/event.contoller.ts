import {Request, Response} from "express";
import {z} from "zod";
import eventService from "../service/event.service";

const createEventSchema = 
z.object({
    title:z.String().trim().min(3).max(100),
    description: z.string().trim().min(10).max(5000),
    category:z.enum({
        "tech", "music","kids","sports","business","culture","arts","food",
        "education","other"
    }),
    startTime:z.coerce.date(),
    endTime:z.coerce.date(),
    venue:z.string().trim().min(2).max(200),
    capacity:z.number().int().min(1).max(100000)
})
.strict();
export async function createEvent(req:Request,res :Response) {
    const result = createEventSchema.safeParse(req.body);

    if(!result.success) {
        const issue = result.error.issues[0];
        const field = issue?.path.join("." ) || "body";
        return res.status(400).json({
            error: {code:"Validation_error",message:'${field}: ${issue?.message}'},

        });
    }

    const data = result.date;
    if(data.startTime <= new Date()){
        return res.status (400).json({
            error: {
        code:"validation_error",message:"startTime:should be in future"
            },
        });

    }
    if(data.endTime && data.endTime <= data.startTime ){
        return res.status (400).json({
            error:{code : "Validation_error" ,message:"endtime should be after starting time "},

        });
    
    }
    const event = await eventService.createEvent(String (req.user!.id),data);
    res.status(201).json({event});
}

