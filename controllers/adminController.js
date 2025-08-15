import validator from "validator";
import bycypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// Api for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, image, specialization, degree, experience, about, available, fee, address } =
            req.body;

        const imageFile = req.file;
        // Validate required fields
        if (!name || !email || !password || !specialization || !degree || !experience || !about || !fee || !address) {
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

// api for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Generate JWT token for admin
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            return res.status(200).json({
                success: true,
                message: "Admin logged in successfully",
                token: token,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
    } catch (error) {
        console.error("Error logging in admin:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

//api for getting all doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password"); // Exclude password from the response
        res.status(200).json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// api to get all appointments
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Api to cancelled appointment
const cancelAppointmentAdmin = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        // Cancel the appointment
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Release the slot back to the doctor
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked || {};

        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        return res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling appointment:", error.message);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// Api to get dashboard data for admin panel
const adminDashboardData = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashboardData = {
            doctors: doctors.length,
            patients: users.length,
            appointments: appointments.length,
            latestAppointments: appointments.reverse().slice(0, 5),
        };
        res.status(200).json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { addDoctor, loginAdmin, getAllDoctors, appointmentsAdmin, cancelAppointmentAdmin, adminDashboardData };
