const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URL =
    // process.env.PROD_DATABASE //production db
    process.env.STAGE_DATABASE; //development db

const PORT = process.env.PORT || 4200;
const app = express();
app.use(cors());
const authRoute = require("./routes/auth");
const logger = require("./utils/logger");
const { response } = require("express");

app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        return res.status(200).json({});
    }
    next();
});

mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        logger.log("info", "Connection To Database Is Successful");
    })
    .catch((err) => {
        logger.log("error", `Some Error In Connecting MongoDb :- %s`, err);
    });

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded());

app.use("/", authRoute);

app.get("/", (req, res) => {
    res.send(`Server Is Running Properly On Port ${PORT}`);
});

app.listen(PORT, () => {
    logger.log("info", `Server Is Running On Port ${PORT} For Testing`);
});