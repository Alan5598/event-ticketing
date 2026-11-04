import { Response } from "express";
import {z} from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createEvent as createEventRecord } from "../services/event.service";

const createEventSchema = 
z.object({
    title:z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(5000),
    category:z.enum(["tech", "music","kids","sports","business","culture","arts","food",
        "education","other"]
        
    ),
    startTime:z.coerce.date(),
    endTime:z.coerce.date().optional(),
    venue:z.string().trim().min(2).max(200),
    capacity:z.number().int().min(1).max(100000)
})
.strict();
export async function createEvent(req: AuthenticatedRequest, res: Response) {
    const result = createEventSchema.safeParse(req.body);

    if(!result.success) {
        const issue = result.error.issues[0];
        const field = issue?.path.join("." ) || "body";
        return res.status(400).json({
            error: {code:"Validation_error",message:`${field}: ${issue?.message}`},

        });
    }

    const data = result.data;
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
    const event = await createEventRecord(String(req.user!.id), data);
    res.status(201).json({event});
}
