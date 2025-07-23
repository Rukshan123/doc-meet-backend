import validator from "validator";
import bycypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";

// Api for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, image, specialization, degree, experience, about, available, fee, address } =
            req.body;

        const imageFile = req.file;

        // console.log(
        //     { name, email, password, image, specialization, degree, experience, about, available, fee, address },
        //     imageFile
        // );

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !specialization ||
            !degree ||
            !experience ||
            !about ||
            !available ||
            !fee ||
            !address
        ) {
            return res.status(400).json({ success: false, message: "Please fill all the fields" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }
        // Validate strong password
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
            });
        }

        // hashing docotor password
        const salt = await bycypt.genSalt(10); //  10 is the number of rounds for hashing
        const hashedPassword = await bycypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const docotorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            specialization,
            degree,
            experience,
            about,
            available,
            fee,
            address: JSON.parse(address),
            date: Date.now(),
        };

        const newDoctor = await new doctorModel(docotorData).save();

        res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            data: newDoctor,
        });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { addDoctor };
