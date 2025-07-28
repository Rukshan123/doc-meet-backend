import doctorModel from "../models/doctorModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.params;

        const docdata = await doctorModel.findById(docId);
        console.log("Doctor data fetched:", docdata);
        await doctorModel.findByIdAndUpdate(docId, { available: !docdata.available });
        res.status(200).json({
            success: true,
            message: "Availability changed successfully",
            available: !docdata.available,
        });
    } catch (error) {
        console.error("Error changing availability:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllDoctorsList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password"); // Exclude email,password from the response
        res.status(200).json({
            success: true,
            doctors,
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

export { changeAvailability, getAllDoctorsList };
