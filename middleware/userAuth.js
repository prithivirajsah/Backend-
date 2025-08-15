import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            success: false,
            message: 'Not authorized. Please log in again.'
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            // Attach userID to req.body so controllers can use it
            req.body.userID = tokenDecode.id;
            next();
        } else {
            return res.json({
                success: false,
                message: 'Not authorized. Invalid token.'
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

export default userAuth;