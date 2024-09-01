const express = require("express");
const router = express.Router();
const jwt = require("../utils/jwt/jwt");
const userController = require("../controllers/user.controller");
const businessConsultantController = require("../controllers/businessConsultant.controller");
const professionalController = require("../controllers/professional.controller");
const dashboardController = require("../controllers/dashboard.controller");
const adminController = require("../controllers/admin.controller");
const atecoController = require("../controllers/ateco.controller");
const chatController = require("../controllers/chat.controller");
const multers = require("../utils/multer/multers");
const authGuard = require("../middlewares/authGuard");
const models = require("../utils/MongoDB/models");
const hash = require("../utils/hash/hash");
const tagController = require("../controllers/tag.controller");

router.get("/", function (req, res) {
  res.json({
    status: 200,
    detail: "API works properly",
  });
});

// ******  STANDARD USER  ******
router.post("/user/signUp", userController.signUp);
router.post("/user/login", userController.login);
router.post("/user/logout", authGuard.AuthGuard, userController.logout);
router.post("/user/resetPassword", userController.resetPassword);
router.post("/user/setPassword", userController.setPassword);
router.post(
  "/user/setFavouiriteProfessional",
  authGuard.AuthGuard,
  userController.setFavouiriteProfessional
);
router.post(
  "/user/removeFavouiriteProfessional",
  authGuard.AuthGuard,
  userController.removeFavouiriteProfessional
);
router.post("/user/getSecurityQuestion", userController.getSecurityQuestion);
router.post(
  "/user/deleteAccount",
  authGuard.AuthGuard,
  userController.deleteAccount
);
router.post("/user/getUser", authGuard.AuthGuard, userController.getUser);

router.get("/user/getProfessional", userController.getProfessional);
router.get("/user/getAllProfessionals", userController.getAllProfessionals);
router.get(
  "/user/getAllActiveProfessionals",
  userController.getAllActiveProfessionals
);
router.get("/user/getAllAteco", atecoController.getAllAteco);

// ******  BUSINESS CONSULTANT ******

router.post(
  "/businessConsultant/signUp",
  multers.uploadFile.single("selfCertified"),
  businessConsultantController.signUp
);
router.post("/businessConsultant/login", businessConsultantController.login);
router.post(
  "/businessConsultant/logout",
  authGuard.AuthGuard,
  businessConsultantController.logout
);
router.post(
  "/businessConsultant/resetPassword",
  businessConsultantController.resetPassword
);
router.post(
  "/businessConsultant/setPassword",
  businessConsultantController.setPassword
);
router.post(
  "/businessConsultant/setProfessional",
  businessConsultantController.setProfessional
);
router.post(
  "/businessConsultant/getSecurityQuestion",
  businessConsultantController.getSecurityQuestion
);
router.post(
  "/businessConsultant/getAllProfessionals",
  authGuard.AuthGuard,
  businessConsultantController.getAllProfessionals
);
router.post(
  "/businessConsultant/updateFields",
  authGuard.AuthGuard,
  businessConsultantController.updateFields
);
router.post(
  "/businessConsultant/updateSelfCertified",
  authGuard.AuthGuard,
  multers.uploadFile.single("selfCertified"),
  businessConsultantController.updateSelfCertified
);
router.post(
  "/businessConsultant/deleteAccount",
  authGuard.AuthGuard,
  businessConsultantController.deleteAccount
);
router.post(
  "/businessConsultant/signUpProfessional",
  authGuard.AuthGuard,
  businessConsultantController.signUpProfessional
);
router.post(
  "/businessConsultant/updateProfessional",
  authGuard.AuthGuard,
  businessConsultantController.updateProfessional
);
router.post(
  "/businessConsultant/getAllActiveProfessionals",
  authGuard.AuthGuard,
  businessConsultantController.getAllActiveProfessionals
);
router.post(
  "/businessConsultant/getAllUnactiveProfessionals",
  authGuard.AuthGuard,
  businessConsultantController.getAllUnactiveProfessionals
);
router.post(
  "/businessConsultant/getAllAteco",
  authGuard.AuthGuard,
  atecoController.getAllAteco
);
router.get(
  "/businessConsultant/getBusinessConsultant",
  authGuard.AuthGuard,
  businessConsultantController.getBusinessConsultant
);

// ******  PROFESSIONAL ******

router.post("/professional/signUp", professionalController.signUp);
router.post("/professional/login", professionalController.login);
router.post(
  "/professional/logout",
  authGuard.AuthGuard,
  professionalController.logout
);
router.post(
  "/professional/deleteAccount",
  authGuard.AuthGuard,
  professionalController.deleteAccount
);
router.post(
  "/professional/resetPassword",
  professionalController.resetPassword
);
router.post("/professional/setPassword", professionalController.setPassword);
router.post(
  "/professional/getSecurityQuestion",
  professionalController.getSecurityQuestion
);
router.post(
  "/professional/uploadProfilePic",
  authGuard.AuthGuard,
  multers.uploadProfilePic.single("profilePic"),
  professionalController.uploadProfilePic
);
router.post(
  "/professional/uploadAboutUs",
  authGuard.AuthGuard,
  multers.uploadGallery.fields([
    { name: "aboutUsGallery", maxCount: 1 },
    { name: "specializationsGallery", maxCount: 1 },
  ]),
  professionalController.uploadAboutUs
);
router.delete(
  "/professional/removeAboutUs",
  authGuard.AuthGuard,
  professionalController.removeAboutUs
);
router.post(
  "/professional/updateFields",
  authGuard.professional,
  professionalController.updateFields
);
router.post("/professional/activate", professionalController.activate);

// ****** ADMIN ******

//**** da rimuovere, solo per primo inserimento dell'account owner
router.post("/admin/setOwner", adminController.setOwner);
//****
router.post("/admin/ownerSendLoginToken", adminController.ownerSendLoginToken);
router.post("/admin/ownerLogin", adminController.ownerLogin);
router.post("/admin/ownerLogout", authGuard.owner, adminController.ownerLogout);
router.post("/admin/setStaff", authGuard.owner, adminController.setStaff);
router.post("/admin/getAllStaff", authGuard.owner, adminController.getAllStaff);
router.post("/admin/getAdmin", authGuard.owner, adminController.getAdmin);
router.post("/admin/removeStaff", authGuard.owner, adminController.removeStaff);
router.post("/admin/staffSignUp", adminController.staffSignUp);
router.post(
  "/admin/staffLogin",
  authGuard.staffLogin,
  adminController.staffLogin
);
router.post("/admin/staffLogout", authGuard.staff, adminController.staffLogout);
router.post("/admin/staffResetPassword", adminController.staffResetPassword);
router.post("/admin/staffSetPassword", adminController.staffSetPassword);
router.post(
  "/admin/getWithoutBusinessConsultant",
  authGuard.staff,
  adminController.getGuestBusinessConsultants
);
router.post("/admin/getAllAteco", authGuard.staff, atecoController.getAllAteco);
router.get(
  "/admin/getStaffSecurityQuestion",
  adminController.getStaffSecurityQuestion
);

// ****** WEBSITE GETTING DATA ******

// *** social ***

router.post(
  "/social/createPost",
  authGuard.professional,
  multers.uploadPost.single("image"),
  professionalController.createPost
);
router.post(
  "/social/getOnePost",
  authGuard.professional,
  professionalController.getOnePost
);
router.post(
  "/social/getAllPosts",
  authGuard.professional,
  professionalController.getAllPosts
);
router.post(
  "/social/updatePost",
  authGuard.professional,
  multers.uploadPost.single("image"),
  professionalController.updatePost
);
router.post(
  "/social/removePost",
  authGuard.professional,
  professionalController.removePost
);
router.get(
  "/social/getFollowingProfessionals",
  authGuard.professional,
  professionalController.getFollowingProfessionals
);
router.post(
  "/social/setFollowedProfessional",
  authGuard.professional,
  professionalController.setFollowedProfessional
);
router.post(
  "/social/removeFollowedProfessional",
  authGuard.professional,
  professionalController.removeFollowedProfessional
);
router.post(
  "/social/getFollowedPosts",
  authGuard.professional,
  professionalController.getFollowedPosts
);

router.post(
  "/social/addComment",
  authGuard.professional,
  professionalController.addComment
);
router.post(
  "/social/getComments",
  authGuard.professional,
  professionalController.getComments
);
router.post(
  "/social/removeComment",
  authGuard.professional,
  professionalController.removeComment
);
router.post(
  "/social/getProfessional",
  authGuard.professional,
  professionalController.getProfessional
);
router.get(
  "/social/getProfessionals",
  authGuard.professional,
  professionalController.getProfessionals
);

router.post(
  "/social/addLike",
  authGuard.professional,
  professionalController.addLike
);
router.post(
  "/social/getLikes",
  authGuard.professional,
  professionalController.getLikes
);
router.post(
  "/social/removeLike",
  authGuard.professional,
  professionalController.removeLike
);

router.post("/social/addReview", authGuard.AuthGuard, userController.addReview);
router.post(
  "/social/removeReview",
  authGuard.AuthGuard,
  userController.removeReview
);

router.post(
  "/social/getOwnPosts",
  authGuard.professional,
  professionalController.getAllOwnPosts
);

// ****** ANALYTICS ******

router.get(
  "/dashboard/getAllProfessionals",
  authGuard.staff,
  dashboardController.getAllProfessionals
);
router.get(
  "/dashboard/getProfessionalsPerDate",
  authGuard.owner,
  dashboardController.getProfessionalsPerDate
);
router.get(
  "/dashboard/getAllIncomeInInterval",
  authGuard.owner,
  dashboardController.getAllIncomeInInterval
);
router.get(
  "/dashboard/getAnnualIncome",
  authGuard.owner,
  dashboardController.getAnnualIncome
);
router.get(
  "/dashboard/getAmountToPay",
  authGuard.owner,
  dashboardController.getAmountToPay
);
router.get(
  "/dashboard/getMostPerformantAteco",
  authGuard.owner,
  atecoController.getMostPerformant
);
router.get(
  "/dashboard/getAllBusinessConsultants",
  authGuard.staff,
  dashboardController.getAllBusinessConsultants
);
router.get(
  "/dashboard/getAndGenerateReport",
  authGuard.staff,
  dashboardController.getAndGenerateReport
);
router.get(
  "/dashboard/getAllBusinessConsultantsDetailed",
  authGuard.staff,
  dashboardController.getAllBusinessConsultantsDetailed
);
router.get(
  "/dashboard/getAllUsersDetailed",
  authGuard.staff,
  dashboardController.getAllUsersDetailed
);

// ***** chat *****

router.get("/chat/getChat", authGuard.chat, chatController.getChat);
router.get("/chat/getDestinatari", chatController.getDestinatari);
router.get(
  "/chat/getUserUnreadCount",
  authGuard.chat,
  chatController.getUserUnreadCount
);
router.get(
  "/chat/getProfessionalUnreadCount",
  authGuard.chat,
  chatController.getProfessionalUnreadCount
);
router.get(
  "/chat/getTotalUnreadCount",
  authGuard.chat,
  chatController.getTotalUnreadCount
);

// ***** tag *****

router.post("/tags/createTag", tagController.createTag);
router.get("/tags", tagController.getAllTags);
router.get("/tags/getTagById/:id", tagController.getTagById);
router.put("/tags/updateTag/:id", tagController.updateTag);
router.delete("/tags/deleteTag/:id", tagController.deleteTag);

module.exports = router;
