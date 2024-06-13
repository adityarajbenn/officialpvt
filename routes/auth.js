const express = require("express");
const router = express.Router();
const { _authMiddleware } = require("../common/middleware/auth");
const { _tagUUID } = require("../common/middleware/reqUUID");
const { _verify } = require("../common/middleware/userTypeCheck");

const {
    getInfluencerByUsername,
    login,
    signup,
    refer,
    unamecheck,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isPhoneNumberAdded,
} = require("../controllers/auth");

router.get("/influencer/:username", _tagUUID, getInfluencerByUsername);
router.get(
    "/fetch/influencer/:username",
    _tagUUID,
    _authMiddleware,
    _verify("influencer"),
    fetchInfluencerDetails
);
router.post(
    "/addPhoneNumber",
    _tagUUID,
    _authMiddleware,
    _verify("influencer"),
    addPhoneNumber
);
router.post(
    "/isPhoneNumberAdded",
    _tagUUID,
    _authMiddleware,
    _verify("influencer"),
    isPhoneNumberAdded
);
router.post("/signup/:referToken?", _tagUUID, signup);
router.post("/unamecheck", _tagUUID, unamecheck);
router.post(
    "/refer-mail",
    _tagUUID,
    _authMiddleware,
    _verify("influencer"),
    refer
);
router.post("/login", _tagUUID, login);
router.post("/loginByPhoneNumber", _tagUUID, loginByPhoneNumber);
router.post("/forgot-password", _tagUUID, forgotPassword);
router.post("/reset-password/:resetToken", _tagUUID, resetPassword);
router.post("/reset-password", _tagUUID, resetPassword);
router.post("/verify-email/:verifyToken", _tagUUID, verifyEmail);
router.get("/presignedurl", _tagUUID, generatePreSignedUrl);
router.post(
    "/imageUpload",
    _tagUUID,
    _authMiddleware,
    _verify("influencer"),
    uploadImageGenerateURL
);
router.post("/doUserLoginOrSignup", _tagUUID, doUserLoginOrSignup);
router.post("/otpGenerate", _tagUUID, otpGenerateApi);

module.exports = router;
