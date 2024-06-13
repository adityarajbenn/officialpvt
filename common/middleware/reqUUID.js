// import { v4 as uuidv4 } from 'uuid';
const { v4 } = require("uuid");
exports._tagUUID = async (req, res, next) => {
    req['headers']['requestId'] = v4();
    next();
}