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

export { changeAvailability };
