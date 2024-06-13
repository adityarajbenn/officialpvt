const jwt = require("jsonwebtoken");
const logger = require("../../utils/logger");

exports._authMiddleware = async (req, res, next) => {
    try {
        if (
            req.body.isLogin === "false" &&
            req.body.key === process.env.AUTH_API_KEY
        ) {
            next();
        } else {
            if (
                req.headers["authorization"] &&
                req.headers["authorization"].startsWith("bearer ")
            ) {
                let token = req.headers["authorization"];
                token = token.slice(7, token.length);
                let result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

                // todo: check for blacklist user
                // ----

                if (result) {
                    req.body.userId = result.userId;
                    req.body.userType = result.userType;
                    next();
                } else {
                    logger.log(
                        "error",
                        "Auth middleware, Unable to verify the token: %s",
                        token,
                        { metadata: { url: req.route.path } }
                    );
                    return res.status(401).json({
                        message2: "Invalid Token",
                        message: "Missing header",
                        info: "Please send valid token",
                        isTokenValid: false,
                    });
                }
            } else {
                logger.log("error", "Auth middleware, No authorization headers found", {
                    metadata: { url: req.route.path },
                });
                return res.status(401).json({
                    message: "Missing header",
                    info: "Header is missing in the request, Please add header to access resource",
                    isTokenValid: false,
                });
            }
        }
    } catch (error) {
        logger.log(
            "error",
            "Auth middleware, Something went wrong, err: %o",
            error,
            { metadata: { url: req.route.path } }
        );
        return res.status(401).json({
            errors: {
                message: "Token Missing In Request, Please login or register..",
                info: "Token needs to authorize to access requests.",
                isTokenValid: false,
                error,
            },
        });
    }
};
