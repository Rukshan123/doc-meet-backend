import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = (req, res, next) => {
    const { atoken } = req.headers;

    if (!atoken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }

    try {
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

        if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.status(403).json({
                success: false,
                message: "Forbidden access",
            });
        }
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("JWT verification failed:", error);
        return res.status(403).json({
            success: false,
            message: "Forbidden access",
        });
    }
};

export default authAdmin;
