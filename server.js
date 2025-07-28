import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloundnary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";

// app configuration
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middleware
app.use(cors());
app.use(express.json());

// api endpoints

// admin routes
app.use("/api/admin", adminRouter);
// doctor routes
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the API!!");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
