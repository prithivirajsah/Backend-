import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true
}));


app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Handle malformed/empty JSON bodies gracefully
app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    next(err);
});

app.listen(port, () => console.log(`Server started on PORT:${port}`));