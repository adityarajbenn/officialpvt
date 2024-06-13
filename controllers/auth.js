const User = require("../models/users");
const Refer = require("../models/refer");
const premiumPost = require("../models/premiumPost");
const subscriptions = require("../models/subscriptionCharges");
const subscriptionData = require("../models/subscription");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userDetails = require("../models/userDetails");
const uuid4 = require("uuid4");
const AWS = require("aws-sdk");
const logger = require("../utils/logger");
const INFLUENCER = "influencer";
const INDIA = "IN";
let isBlackListed = false;
let getPostCounts=()=>{
    return 10;
}

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    useAccelerateEndpoint: true,
    region: "ap-south-1",
});

async function generateAccessToken(userId, userType) {
    let signKey = await jwt.sign(
        { userId, userType },
        process.env.ACCESS_TOKEN_SECRET
    );
    let signKey2 = await jwt.sign(
        { userId, userType },
        process.env.REFRESH_TOKEN_SECRET
    );
    return { accessToken: signKey, refreshToken: signKey2 };
}

const isPhoneNumberAdded = async (req, res) => {
    try {
        const { influencerId } = req.body;
        const user = await User.findOne({ _id: influencerId });
        const phoneNumber = user.phoneNumber;
        if (phoneNumber) {
            return res.json({
                status: true,
                message: "Phone Number Exists",
                isPhoneNoExist: true,
            });
        } else {
            logger.log(
                "info",
                "Auth, isPhoneNumberAdded, Phone Number already exists : %s for influencer %s",
                phoneNumber,
                user.username,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                status: true,
                message: "Phone Number Does Not Exist",
                isPhoneNoExist: false,
            });
        }
    } catch (err) {
        logger.log(
            "error",
            "Auth, isPhoneNumberAdded, something went wrong error: %o",
            err,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            status: false,
            message: "No Registered Phone Number",
            data: {},
        });
    }
};

const signup = async (req, res) => {
    try {
        const { referToken } = req.query;

        let {
            email,
            password,
            username,
            name,
            instagram,
            facebook,
            twitter,
            linkedin,
            addMoreLinks,
            userType,
            referredBy,
            phoneNumber,
            referralKey,
        } = req.body;
        logger.log(
            "info",
            "Auth, signup, Signup for email: %s for role: %s",
            email,
            userType,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );

        if (userType === INFLUENCER) {
            const user = await User.findOne({
                $or: [{ username: username }, { email: email }],
            });
            if (user) {
                logger.log(
                    "error",
                    "Auth, signup, Signup failed, User already registered with email: %s for role: %s",
                    email,
                    userType,
                    { metadata: { requestId: req["headers"]["requestId"] } }
                );
                return res.json({
                    message: "User already registered",
                    status: false,
                });
            } else {
                const salt = await bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(password, salt);
                const country = req.headers["cf-ipcountry"];
                let currency = country === INDIA ? "INR" : "USD";
                let referralType;
                if (referralKey) {
                    referredBy = (await User.findOne({ referralKey }))._id;
                    referralType = "influencer";
                }
                const createdReferralKey = generateReferralKey();
                let newUser = new User({
                    email,
                    password: passwordHash,
                    username,
                    name,
                    instagram,
                    facebook,
                    twitter,
                    linkedin,
                    country,
                    currency,
                    userType,
                    addMoreLinks,
                    referredBy,
                    referralKey: createdReferralKey,
                    referralType,
                });
                let userDetailsCreated = await userDetails.create({
                    influencerId: newUser._id,
                    influencerUserName: username,
                });
                logger.log(
                    "info",
                    "Auth, signup, Signup User details created in the database",
                    {
                        metadata: { requestId: req["headers"]["requestId"] },
                    }
                );
                if (referredBy) {
                    logger.log(
                        "info",
                        "Auth, signup, User is referred by: %s",
                        referredBy,
                        {
                            metadata: { requestId: req["headers"]["requestId"] },
                        }
                    );
                    userDetailsCreated.referredBy = referredBy;
                    const refereeUser = await User.findOne({ _id: referredBy }).exec();
                    const sendMailToReferee = await sendReferenceMail(
                        refereeUser.email,
                        newUser.email,
                        req["headers"]["requestId"]
                    );
                }

                if (referToken) {
                    const { refereeId } = jwt.verify(
                        referToken,
                        process.env.ACCESS_TOKEN_SECRET
                    );
                    const newReferDetails = await Refer.findByIdAndUpdate(
                        { _id: refereeId },
                        { user_points: 500, referee_points: 1000, isJoined: true },
                        { new: true }
                    );
                    logger.log("info", "Auth, Signup, updated referer details", {
                        metadata: { requestId: req["headers"]["requestId"] },
                    });
                    newUser.referredType = "agency";
                }

                let response = {};
                const resUser = await newUser.save();
                const resUserDetail = await userDetailsCreated.save();
                logger.log("info", "Auth, Signup, User saved in the database", {
                    metadata: { requestId: req["headers"]["requestId"] },
                });

                if (resUser) {
                    const premiumPostObj = [
                        {
                            userId: resUser._id,
                            heading: "Brand Promotions/Collaborations",
                            subheading: "I will promote your brand on my Instagram story",
                            amount: 99,
                            isHided: true,
                        },

                        {
                            userId: resUser._id,
                            heading: "Video chat with me on Instagram",
                            subheading: "Video chat with me on Instagram for sometime",
                            amount: 199,
                            isHided: true,
                        },

                        {
                            userId: resUser._id,
                            heading: "Personalised video wishes",
                            subheading: "I will send wishes for any occassions",
                            amount: 299,
                            isHided: true,
                        },

                        {
                            userId: resUser._id,
                            heading: "Personalised Instagram post",
                            subheading: "For profile/brand promotions",
                            amount: 55,
                            isHided: true,
                        },
                    ];
                    const premiumPostRes = await premiumPost.create(premiumPostObj);
                    logger.log("info", "Auth, Signup, Created default premium posts", {
                        metadata: { requestId: req["headers"]["requestId"] },
                    });
                }
                if (resUser) {
                    let {
                        _id,
                        addMoreLinks,
                        email,
                        username,
                        name,
                        instagram,
                        facebook,
                        twitter,
                        linkedin,
                        userType,
                        influencer,
                        user,
                        referralKey,
                    } = resUser;

                    response = {
                        savedUserData: {
                            id: _id,
                            addMoreLinks,
                            email,
                            username,
                            name,
                            instagram,
                            facebook,
                            twitter,
                            linkedin,
                            influencer,
                            user,
                            userType,
                            referralKey,
                        },
                        message: "User registered successfully",
                        status: true,
                    };
                } else {
                    logger.log(
                        "error",
                        "Auth, signup, Signup failed Unable to create user username: %s, email: %s, userType: %s",
                        username,
                        email,
                        userType,
                        {
                            metadata: {
                                req: req.body,
                                requestId: req["headers"]["requestId"],
                            },
                        }
                    );
                    response = {
                        message: "You are not registered please Sign-up",
                        status: false,
                    };
                }

                const tokens = await generateAccessToken(resUser._id, resUser.userType);
                if (tokens) {
                    logger.log("info", "Auth, Signup, sent email and generated token", {
                        metadata: { requestId: req["headers"]["requestId"] },
                    });
                    response["accessToken"] = tokens.accessToken;
                    response["refreshToken"] = tokens.refreshToken;
                    return res.json(response);
                } else {
                    logger.log(
                        "error",
                        "Auth, signup, Signup failed, Unable to generate tokens",
                        {
                            metadata: { requestId: req["headers"]["requestId"] },
                        }
                    );
                    return res.json({
                        message: "Token Generation Failed",
                        status: false,
                    });
                }
            }
        } else if (userType === "user" || userType === "agency") {
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);
            const user = await User.findOne({
                $or: [{ username: username }, { email: email }],
            });
            if (user) {
                logger.log(
                    "error",
                    "Auth, signup, Signup failed, User already registered with email: %s for role: %s",
                    email,
                    userType,
                    { metadata: { requestId: req["headers"]["requestId"] } }
                );
                return res.json({
                    message: "User already registered",
                    status: false,
                });
            } else {
                const newUser = new User({
                    email: email,
                    password: passwordHash,
                    username: username,
                    name: name,
                    instagram: instagram,
                    facebook: facebook,
                    twitter: twitter,
                    linkedin: linkedin,
                    phoneNumber: phoneNumber,
                    userType,
                    addMoreLinks,
                });

                let response = {};
                const resUser = await newUser.save();
                logger.log("info", "Auth, Signup, User saved in the database", {
                    metadata: { requestId: req["headers"]["requestId"] },
                });

                if (resUser) {
                    const {
                        _id,
                        addMoreLinks,
                        email,
                        username,
                        name,
                        instagram,
                        facebook,
                        twitter,
                        linkedin,
                        userType,
                        phoneNumber,
                    } = resUser;
                    response = {
                        message: "User registered successfully",
                        savedUserData: {
                            id: _id,
                            addMoreLinks,
                            email,
                            username,
                            name,
                            instagram,
                            facebook,
                            twitter,
                            linkedin,
                            userType,
                            phoneNumber,
                        },
                        status: true,
                    };
                } else {
                    logger.log(
                        "error",
                        "Auth, signup, Signup failed Unable to create user username: %s, email: %s, userType: %s",
                        username,
                        email,
                        userType,
                        {
                            metadata: {
                                req: req.body,
                                requestId: req["headers"]["requestId"],
                            },
                        }
                    );
                    response = {
                        message: "You are not registered please Sign-up",
                        status: false,
                    };
                }

                const tokens = await generateAccessToken(resUser._id, resUser.userType);
                if (tokens) {
                    logger.log("info", "Auth, Signup, sent email and generated token", {
                        metadata: { requestId: req["headers"]["requestId"] },
                    });
                    response["accessToken"] = tokens.accessToken;
                    response["refreshToken"] = tokens.refreshToken;
                    return res.json(response);
                } else {
                    logger.log(
                        "error",
                        "Auth, signup, Signup failed, Unable to generate tokens",
                        {
                            metadata: { requestId: req["headers"]["requestId"] },
                        }
                    );
                    return res.json({
                        message: "Token Generation Failed",
                        status: false,
                    });
                }
            }
        }
    } catch (err) {
        logger.log(
            "error",
            "Auth, signup, Signup failed, Something went wrong, err: %o",
            err,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            message: "SignUp failed",
            status: false,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        if (!userData) {
            logger.log(
                "info",
                `Auth, Login, User with email %s does not exist`,
                email,
                {
                    metadata: { req: req.body, requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                message: "No user found",
                status: false,
            });
        }
        if (userData.userType === "user") {
            logger.log('info', `Auth, login, Please login as a Influencer or Agency`, { metadata: { requestId: req['headers']['requestId'] } });
            return res.json({
                message: "Please login as Influencer or Agency",
                status: false,
            });
        }
        let isUserBlackListed=false;
        if (isUserBlackListed) {
            return res.json({
                status: false,
                message:
                    "Sorry Your Account Has Been Blacklisted Please Contact Us at support@support.com",
            });
        }
        let subscriptionDetails;
        if (userData.userType === "user") {
            subscriptionDetails = await subscriptionData.find(
                { userId: userData._id },
                { subscriptionId: 1, userId: 1, influencerId: 1 }
            );
        }
        let token = {};
        const {
            _id,
            addMoreLinks,
            username,
            name,
            instagram,
            facebook,
            twitter,
            linkedin,
            userType,
            userProfileImage,
            influencer,
            user,
            userBio,
            phoneNumber,
            referralKey,
        } = userData;

        let userSet = new Set();
        user.forEach((x) => {
            if (!!x) {
                userSet.add(x.toString());
            }
        });

        if (await bcrypt.compare(password, userData.password)) {
            token = await generateAccessToken(userData._id, userData.userType);
            logger.log(
                "info",
                "Auth, Login, Login sucessful for email: %s for role: %s",
                email,
                userType,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                id: _id,
                addMoreLinks,
                email,
                username,
                name,
                instagram,
                facebook,
                twitter,
                linkedin,
                ...token,
                userType,
                userProfileImage,
                userBio,
                influencer,
                user: userSet.size,
                subscriptionDetails,
                phoneNumber,
                referralKey,
                status: true,
                message: "Logged in sucessfully",
            });
        } else {
            logger.log("error", "Auth, login, Login failed, invalid credentials", {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({
                status: false,
                message: "Invalid Credentials",
            });
        }
    } catch (err) {
        logger.log(
            "error",
            "Auth, login, Login failed, something went wrong error: %o",
            err,
            {
                metadata: { req: req.body, requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            status: false,
            message: "Something went wrong",
        });
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        let mailDetails = {
            from: "hi@officialpvt", // sender address
            to: email,
            subject: "Reset Passsword", // Subject line
            text: "Use the below link to reset your password", // plain text body
        };
        if (!email) {
            logger.log("info", "Auth, forgotPassword, Invalid request", {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({
                message: "user does not exist",
                status: false,
            });
        }
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30m",
        });
        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: "hi@officialpvt",
                pass: "fixntgtjfvspjfyf",
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                message: "user does not exist",
                status: false,
            });
        }
        const userType = user.userType;
        if (userType === "user") {
            mailDetails.html = ` <h3>Hey, </h3>
				<h4> Use the below link to reset your password </h4>
				 <h4> https://www.officialpvt/p/user/reset-password/${token} </h4>`;
            let info = await transport.sendMail(mailDetails);
            logger.log("info", `Auth, forgotPassword, Email  with email: %s`, email, {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({
                message: "Mail sent",
                status: true,
                token: token,
            });
        } else if (userType === INFLUENCER || userType === "agency") {
            const { username } = await User.findOne({ email }).select("username");
            if (username) {
                mailDetails.html = ` <h3>Hey ${username}, </h3>
					<h4> Use the below link to reset your password </h4>
					 <h4> https://www.officialpvt/p/${username}/reset-password/${token} </h4>`; // html body
                let info = await transport.sendMail(mailDetails);
                logger.log(
                    "info",
                    `Auth, forgotPassword, Email sent to %s with email: %s`,
                    username,
                    email,
                    {
                        metadata: { requestId: req["headers"]["requestId"] },
                    }
                );
                return res.json({
                    message: "Mail sent",
                    status: true,
                    token: token,
                });
            } else {
                logger.log(
                    "info",
                    `Auth, forgotPassword, user with email: %s is not registered with us `,
                    email,
                    {
                        metadata: { requestId: req["headers"]["requestId"] },
                    }
                );
                return res.json({
                    message: "Email is not registered with us",
                    status: false,
                });
            }
        } else {
            logger.log(
                "info",
                `Auth, user is neither; agency, user or influencer `,
                email,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                message: "Email is not registered with us",
                status: false,
            });
        }
    } catch (error) {
        logger.log(
            "error",
            `Auth, forgotPassword, something went wrong error: %o`,
            error,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            message: "Failed",
            status: false,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        let { password } = req.body;
        const { email } = await jwt.verify(
            resetToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        const userDetail = await User.findOne({ email });
        //TODO: If there is no email what are we sending in the response and can't we merge 2 if blocks?
        if (email) {
            if (userDetail) {
                const salt = await bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(password, salt);
                password = passwordHash;
                const newPassword = await User.findOneAndUpdate(
                    { email },
                    { password },
                    { upsert: true }
                );
                logger.log(
                    "info",
                    `Auth, Reset Password, user with email: %s has been updated sucessfully`,
                    email,
                    {
                        metadata: { requestId: req["headers"]["requestId"] },
                    }
                );
                return res.json({
                    message: "Password Updated Successfully!",
                    status: true,
                });
            } else {
                res.json({
                    message: "Email is not registered",
                    status: false,
                });
            }
        } else {
            res.json({
                message: "Enter a valid email",
                status: false,
            });
        }
    } catch (err) {
        //TODO: there is no error logged
        logger.log(
            "error",
            `Auth, Reset Password, something went wrong error: %o`,
            err,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        res.status(500).json({
            message: "Failed to update password",
            status: false,
        });
    }
};

const unamecheck = async (req, res) => {
    try {
        const { username } = req.body;
        // console.log("username ",/^[\w&.\-]+$/.test( username ))
        // if (/^[\w&.\-]+$/.test( username )) {
        //   return res.json({
        //     message: "Username already exist",
        //     usernameAvailable: false,
        //   });
        // }
        const userData = await User.findOne({ username });

        if (userData) {
            logger.log(
                "error",
                `Auth, User name check, Username: %s already exists please try with a different one`,
                username,
                { metadata: { requestId: req["headers"]["requestId"] } }
            );
            return res.json({
                message: "Username already exist",
                usernameAvailable: false,
            });
        } else {
            logger.log(
                "info",
                `Auth, User name check, Username: %s is available`,
                username,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                message: "Username available",
                usernameAvailable: true,
            });
        }
    } catch (err) {
        logger.log(
            "error",
            `Auth, User name check, something went wrong error: %o`,
            err,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.send({
            message: "Error occurred",
            usernameAvailable: false,
        });
    }
};

const refer = async (req, res) => {
    try {
        const { referee_email, username } = req.body;
        const isUser = await User.findOne({ username });
        if (isUser) {
            const { _id: userId } = await User.findOne({ username }).select("_id");
            const createReferObject = await Refer.create({ userId, referee_email });
            let refereeId = createReferObject._id;

            const token = await jwt.sign(
                { refereeId },
                process.env.ACCESS_TOKEN_SECRET
            );
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                auth: {
                    user: "hi@officialpvt",
                    pass: "fixntgtjfvspjfyf",
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            let info = await transporter.sendMail({
                from: ' hi@officialpvt "officialpvt" ', // sender address
                to: referee_email, // list of receivers
                subject: `${username}, is inviting you to join officialpvt`, // Subject line
                html: `<p> Greetings, </p>
                 <p> Welcome to <b>officialpvt</b>. The exclusive club for top influencers & creators to connect with their followers and increase their earnings.</p>
                 <p><b>${username}</b>, has referred you to join and create an account. </p>
                 <p>So what are you waiting for, <b>create your account</b> and start monetising your talent today!</p><br><br>
                 <div style="width:100%;text-align:center">                 
                 <form action="https://www.officialpvt/p/create?referToken=${token}
                 ">
                 <input style="background-color:#7854F7;padding: 15px 25px;border: 1px white;border-radius: 10px;font-size:16px;color:white" type="submit" value="Sign Up" />
                 </form>
                
                 </div>`,
            });
            logger.log(
                "info",
                `Auth, Refer, mail sucessfully sent to Username: %s `,
                username,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                message: "Mail sent",
                status: true,
                token: token,
            });
        } else {
            logger.log(
                "error",
                `Auth, Refer, Username: %s is incorrect please reenter the username`,
                username,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                message: "Incorrect Username",
                status: false,
            });
        }
    } catch (err) {
        logger.log("error", `Auth, Refer, something went wrong error: %o`, err, {
            metadata: { requestId: req["headers"]["requestId"] },
        });

        return res.json({
            message: "Server Error",
            status: false,
        });
    }
};

const generatePreSignedUrl = async (req, res) => {
    try {
        const signedUrlExpireSeconds = 60 * 5;
        const myBucket = process.env.AWS_S3_BUCKET_NAME;
        const myKey = uuid4();
        let key = "media/" + myKey + ".png";

        const params = {
            Bucket: myBucket,
            Key: key,
            Expires: signedUrlExpireSeconds,
            ACL: `public-read`,
            ContentType: `png/jpeg`,
        };
        const url = await s3.getSignedUrl("putObject", params);
        if (url) {
            let getUrl = url.split("?");
            let urls = {
                putUrl: url,
                getUrl: getUrl[0],
            };
            logger.log("info", `Auth, Presigned, URL created sucessfully `, {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({ status: true, url: urls });
        } else {
            logger.log("info", `Auth, Presigned, unable to get signed URL from s3`, {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({ status: false });
        }
    } catch (error) {
        logger.log(
            "error",
            `Auth, Presigned, something went wrong error: %o`,
            error,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({ status: false });
    }
};

const uploadImageGenerateURL = async (req, res, next) => {
    try {
        const signedUrlExpireSeconds = 60 * 5;
        const myBucket = process.env.AWS_S3_BUCKET_NAME;
        const myKey = uuid4();
        let key = "media/" + myKey + ".png";

        const buf = Buffer.from(
            req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
        );

        const type = req.body.imageBinary.split(";")[0].split("/")[1];

        const params = {
            Bucket: myBucket,
            Body: buf,
            Key: key,
            // Expires: signedUrlExpireSeconds,
            ContentEncoding: "base64",
            ACL: "public-read",
            ContentType: `image/${type}`,
        };

        const response = await s3.upload(params).promise();

        if (response) {
            logger.log(
                "info",
                `Auth, uploadImageGenerateURL, Image URL created sucessfully`,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                status: true,
                data: response,
            });
        } else {
            logger.log(
                "info",
                `Auth, uploadImageGenerateURL, Image URL generation failed`,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                status: false,
                data: response,
            });
        }
        // if (url) {
        //     let getUrl = url.split("?");
        //     let urls = {
        //         putUrl: url,
        //         getUrl: getUrl[0],
        //     };
        //     return res.json({ status: true, url: urls });
        // } else {
        //     return res.json({ status: false });
        // }
    } catch (error) {
        logger.log(
            "error",
            `Auth, uploadImageGenerateURL, some Error occured: %o`,
            error,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({ status: false });
    }
};

const getInfluencerByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        if (username) {
            const influencer = await User.findOne({
                username: username,
            });

            if (!influencer) {
                logger.log(
                    "error",
                    `Auth, getInfluencerByUsername, Influencer with userId: %s not found`,
                    username,
                    {
                        metadata: { requestId: req["headers"]["requestId"] },
                    }
                );
                return res.json({
                    status: false,
                    message: "Influencer not found",
                });
            }

            const isUserBlackListed = await isBlackListed(influencer._id);
            if (isUserBlackListed) {
                return res.json({
                    status: false,
                    message: "Influencer not found",
                });
            }

            const allCountsPromise = getPostCounts(influencer._id);
            const userSubscriptionDataPromise = subscriptions.findOne({
                userId: influencer._id,
            });
            const userPremiumPostDataPromise = premiumPost.find({
                userId: influencer._id,
                isHided: false,
            });
            const responses = await Promise.all([
                userPremiumPostDataPromise,
                userSubscriptionDataPromise,
                allCountsPromise,
            ]);

            const countMap = responses[3].reduce((acc, present) => {
                acc[present._id] = present.count;
                return acc;
            }, {});
            const imageCount = !!countMap["Image"] ? countMap["Image"] : 0;
            const audioCount = !!countMap["Audio"] ? countMap["Audio"] : 0;
            const videoCount = !!countMap["Video"] ? countMap["Video"] : 0;

            let response = {
                _id: influencer._id,
                imageCount,
                audioCount,
                videoCount,
                email: influencer.email,
                username: influencer.username,
                name: influencer.name,
                instagram: influencer.instagram,
                facebook: influencer.facebook,
                twitter: influencer.twitter,
                linkedin: influencer.linkedin,
                userType: influencer.userType,
                addMoreLinks: influencer.addMoreLinks,
                userBio: influencer.userBio,
                userProfileImage: influencer.userProfileImage,
                influencer: influencer.influencer,
                subscriptionDetails:
                    responses[2] == null ? null : responses[2].subscriptionDetails,
                premiumPostDetails: responses[0],
            };

            if (influencer) {
                if (influencer.userType === INFLUENCER) {
                    logger.log(
                        "info",
                        `Auth, getInfluencerByUsername, Influencer with username: %s fetched successfully`,
                        username,
                        { metadata: { requestId: req["headers"]["requestId"] } }
                    );
                } else {
                    logger.log(
                        "info",
                        `Auth, getInfluencerByUsername, Unable to find Influencer with username: %s`,
                        username,
                        { metadata: { requestId: req["headers"]["requestId"] } }
                    );
                }
                return res.json({
                    status: influencer.userType === INFLUENCER,
                    message:
                        influencer.userType === INFLUENCER
                            ? "Influencer fetched successfully"
                            : "Influencer not found",
                    data: response,
                });
            } else {
                logger.log(
                    "info",
                    `Auth, getInfluencerByUsername, Unable to find Influencer with username: %s`,
                    username,
                    { metadata: { requestId: req["headers"]["requestId"] } }
                );
                return res.json({
                    status: false,
                    message: "Influencer not found",
                });
            }
        } else {
            logger.log("info", "Auth, getInfluencerByUsername, username is missing", {
                metadata: { requestId: req["headers"]["requestId"] },
            });
            return res.json({
                status: false,
                message: "username is required",
            });
        }
    } catch (error) {
        logger.log(
            "error",
            `Auth, getInfluencerByUsername, something went wrong error: %o`,
            error,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            status: false,
            message: "User not found",
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        let { verifyToken } = req.params;
        if (verifyToken) {
            const { email } = jwt.verify(
                verifyToken,
                process.env.ACCESS_TOKEN_SECRET
            );
            //const newUserData = await User.findOne({ email: email });
            const newUserData = await User.findOneAndUpdate(
                { email },
                { isVerifiedEmail: true },
                { new: true }
            );
            logger.log(
                "info",
                "Auth, Verify Email, Email: %s is now verified",
                email,
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                status: true,
                message: "Email Verified",
                data: newUserData,
            });
        } else {
            logger.log(
                "error",
                "Auth, Verify Email, Email Verification failed, Token not found",
                {
                    metadata: { requestId: req["headers"]["requestId"] },
                }
            );
            return res.json({
                status: false,
                message: "Email Verification failed, Token not found",
                data: {},
            });
        }
    } catch (err) {
        logger.log(
            "error",
            "Auth, Verify Email, something went wrong error: %o",
            err,
            {
                metadata: { requestId: req["headers"]["requestId"] },
            }
        );
        return res.json({
            status: false,
            message: "Error",
            data: {},
        });
    }
};


async function sendReferenceMail(email, influencerMail, requestId) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: "hi@hi.com",
                pass: "ijhhjbj",
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        let info = await transporter.sendMail({
            from: ' hi@hi.com "officialpvt" ', // sender address
            to: email, // list of receivers
            subject: `${influencerMail} has joined officialpvt`, // Subject line
            text: "Confirmation Mail", // plain text body
            html: `<p> Greetings, </p>
     <p style="font-size:16px"> Welcome to <b>officialpvt</b></p>
     <p style="font-size:16px">${influencerMail} has joined officialpvt through your referral link 
     </p>`,
        });
        logger.log(
            "info",
            `Auth, sendReferenceMail, Reference mail sent sucessfully to: %s`,
            influencerMail,
            {
                metadata: { requestId },
            }
        );
        return true;
    } catch (error) {
        logger.log(
            "error",
            `Auth, sendReferenceMail, Something went wrong error: %o`,
            error,
            {
                metadata: { requestId },
            }
        );
        return false;
    }
}

module.exports = {
    getInfluencerByUsername,
    isPhoneNumberAdded,
    signup,
    login,
    forgotPassword,
    resetPassword,
    refer,
    unamecheck,
    generateAccessToken,
    generatePreSignedUrl,
    verifyEmail,
    uploadImageGenerateURL,
};
