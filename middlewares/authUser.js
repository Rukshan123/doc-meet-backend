import jwt from "jsonwebtoken";

// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = token_decode.userId; // attach decoded userId to req
        next();
    } catch (error) {
        console.error("Error in authUser middleware:", error.message);
        return res.status(403).json({
            success: false,
            message: "Forbidden access",
        });
    }
};

export default authUser;
