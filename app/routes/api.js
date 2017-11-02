/**
 * Created by OliveTech on 10/26/2017.
 */
var express = require('express');
var router = express.Router();

var common = require("../config/common");
var account = require('../controllers/account');
var chat = require('../controllers/chat');


/* account */
router.post("/user/login", account.login);
router.post("/user/findByUsername", account.findByUsername);
router.post("/user/getProfile", account.getProfile);
router.post("/user/updateProfile", account.updateProfile);


/* chat */
router.post("/chat/userList", chat.chatUserList);
router.post("/chat/history", chat.getHistory);
router.post("/chat/sendMessage", chat.sendMessage);




// router.post("/user/verifyconfirm", user.verifyConfirm);
// router.post("/user/signup", user.signup);
// router.post("/user/get", user.get);
// router.post("/user/update", user.update);
// router.post("/user/search", user.search);
// router.post("/user/updatewithphoto", user.updateWithPhoto);
// router.post("/upload", user.upload);
//
// router.post("/user/auth/facebook", user.loginFacebook);
// router.post("/user/me", user.me)
//
// router.post("/user/update123456789abcde", user.passwordRecover);
// router.post('/user/resetpassword', user.resetPassword);


module.exports = router;
