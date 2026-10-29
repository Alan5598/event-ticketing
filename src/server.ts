import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT ?? 4000);

connectDB()
    .then(() => app.listen(port, () => console.log(`API on http://localhost:${port}`)))
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    });