const logger = require('../../utils/logger');

exports._verify = (roles) => async (req, res, next) => {
    if (req.body.userType !== roles) {
        logger.log('error', 'Verify Middleware, User is not authorized to access this resource, only accessible by roles: %s', roles, { metadata: { req: req.body, url: req.route.path } })
        return res.status(403).json({
            status: false,
            message: `only ${roles} can access`
        });
    }
    return next();
};

exports._verifyRoles = (roles) => async (req, res, next) => {
    if (roles.indexOf(req.body.userType) === -1) {
        logger.log('error', 'Verify Middleware, User is not authorized to access this resource, only accessible by roles: %o', roles, { metadata: { req: req.body, url: req.route.path } })
        return res.status(403).json({
            status: false,
            message: `only ${roles} can access`
        });
    }
    return next();
};