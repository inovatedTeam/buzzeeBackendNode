/**
 * Created by OliveTech on 10/26/2017.
 */
var common = require("../config/common")
var config = require('../config/config')
var db = require('../config/database')
var Password = require("node-php-password")
var jwt = require("jsonwebtoken")
var _ = require("underscore")
var path = require("path")
var randomString = require('random-string')


function checkAudentication(req, res, callback) {
    if(!req.headers['token']){
        res.status(401)
        var message = 'There is no authenticate token.';
        return common.sendFullResponse(res, 300,{}, message);
    }
    var token = req.headers['token']
    if (token) {
        jwt.verify(token, config.securty_key, function(err, decoded) {
            if (err) {
                res.status(401)
                var message = 'There is invalid authenticate token.';
                common.sendFullResponse(res, 300,{}, message);
            } else {
                // return user_id
                return callback(decoded.user_id)
            }
        });

    } else {
        var message = 'No token provided.';
        common.sendFullResponse(res, 300,{}, message);
    }
}

exports.login = function(req, res) {
    var bad_result = {

    };
    if (req.body.username == undefined) {
        var message = "Sorry! Error occurred in login1.";
        console.log(message);
        common.sendFullResponse(res, 300,bad_result, message);
    }
    var param = req.body;
    db.query('SELECT * FROM users WHERE username = ?', param.username, function(err, userdata) {
        if (err){
            res.status(401);
            var message = "Sorry! Error occurred in login2.";
            console.log(message);
            common.sendFullResponse(res, 300,bad_result, message);
        }
        if(userdata.length == 0){
            res.status(401);
            var message = "Sorry! Error occurred in login3.";
            console.log(message);
            common.sendFullResponse(res, 300, bad_result, message);
        }else{
            if (checkPassword(param.password, userdata[0])) {
                // get token
                const payload = {
                    user_id: userdata[0].id
                };
                var token = jwt.sign(payload, config.securty_key, {
                    expiresIn: 60*24*365 // expires in a year
                });

                var good_result = {
                    username : userdata[0].username,
                    user_id: userdata[0].id,
                    token : token
                };
                var message = "User login successfully.";
                common.sendFullResponse(res, 200, good_result, message);
                // var response = sendSMSVerification(req, res, userdata[0]);
                // if(response < 10){
                //     res.status(401);
                //     var message = "Sorry! Error occurred in login short_code" + response;
                //     console.log(message);
                //     common.sendFullResponse(res, 300,bad_result, message);
                // }else{
                //     var good_result = {
                //         mobile : req.body.mobile,
                //         smsVerification : true,
                //         code : response,
                //         hasBackup : false
                //     };
                //     var message = "SMS request is initiated! You will be receiving it shortly.";
                //     common.sendFullResponse(res, 200, good_result, message);
                // }
            } else {
                var message = "Security info is incorrect.";
                console.log(message);
                common.sendFullResponse(res, 300,bad_result, message);
            }
        }
    });

};

function checkPassword(password, userData) {
    if(Password.verify(password, userData.password)){
        console.log("password matched");
        return true;
    }else{
        return false;
    }
}
function sendSMSVerification(req, res, userData){
    // get phone number from userData

    var country = req.body.country;
    var mobile = req.body.mobile;
    var shortMessage = getRandomInt(100000, 999999)
    // save database
    db.query('SELECT * FROM bz_short_codes WHERE user_id = ?', userData.id , function(err, chk_data) {
        if (err){
            res.status(401);
            return 0;
        }
        if(chk_data.length == 0){
            db.query('INSERT INTO bz_short_codes SET ?', {user_id: userData.id, country: country, mobile : mobile, short_code : shortMessage} , function(err, result) {
                if (err){
                    res.status(401);
                    return 1;
                }
                return shortMessage;
            })
        }else{
            db.query('UPDATE bz_short_codes SET ? WHERE user_id = '+userData.id, { country: country, mobile : mobile, short_code : shortMessage}, function(err, result) {
                if (err){
                    res.status(401);
                    throw err;
                    // return 2;
                }
                return shortMessage;
            })
        }

    })
    // send verification message to twillio .com
    return shortMessage;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.findByUsername = function(req, res) {
    checkAudentication(req, res, function(user_id) {
        console.log(user_id);

        var bad_result = {};
        if (req.body.search_username == undefined) {
            var message = "Sorry! Error occurred in search user1.";
            console.log(message);
            common.sendFullResponse(res, 300,bad_result, message);
        }
        var param = req.body;
        db.query('SELECT * FROM users WHERE username = ?', param.search_username, function(err, userdata) {
            if (err){
                res.status(401);
                var message = "Sorry! Error occurred in search user2.";
                common.sendFullResponse(res, 300,bad_result, message);
            }
            if(userdata.length == 0){
                res.status(401);
                var message = "Sorry! Error occurred in search user3.";
                common.sendFullResponse(res, 300,bad_result, message);
            }else{
                var photo_url = config.server_image_path;
                if(userdata[0].picture == undefined){
                    photo_url += "avatar.png";
                }else{
                    photo_url += userdata[0].picture;
                }
                var good_result = {
                    username : userdata[0].username,
                    user_id: userdata[0].id,
                    state: 0,
                    photo: photo_url
                };
                var message = "User finded successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            }
        });
    })
};

exports.getProfile = function(req, res) {
    checkAudentication(req, res, function(user_id) {

        var bad_result = {};
        if (req.body.user_id == undefined) {
            var message = "Sorry! Error occurred in profile1.";
            console.log(message);
            common.sendFullResponse(res, 300,bad_result, message);
        }
        db.query('SELECT * FROM users WHERE id = ?', req.body.user_id, function(err, userdata) {
            if (err){
                res.status(401);
                var message = "Sorry! Error occurred in getProfile2.";
                common.sendFullResponse(res, 300, bad_result, message);
            }
            if(userdata.length == 0){
                res.status(401);
                var message = "Sorry! Error occurred in getProfile3.";
                common.sendFullResponse(res, 300,bad_result, message);
            }else{
                var photo_url = config.server_image_path;
                if(userdata[0].picture == undefined){
                    photo_url += "avatar.png";
                }else{
                    photo_url += userdata[0].picture;
                }
                var phone = "";
                if(!userdata[0].phone){
                    phone = "";
                }else{
                    phone = userdata[0].phone;
                }
                var good_result = {
                    username : userdata[0].username,
                    phone : phone,
                    user_id: userdata[0].id,
                    state: 0,
                    photo: photo_url
                };
                var message = "get user profile successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            }
        });
    })
};

function getFileName( filename){
    var ext = path.extname(filename)
    var newFileName = randomString({
        length: 8,
        numeric: true,
        letters: true,
        special: false
    });
    newFileName += ext
    return newFileName;
}

exports.updateProfile = function (req, res) {
    checkAudentication(req, res, function(user_id) {
        if (!req.files){
            res.status(400)
            var message = 'No files were uploaded.';
            return common.sendFullResponse(res, 300,{}, message);
        }
        var photo = req.files.photo;
        var newFileName = getFileName(req.files.photo.name);
        photo.mv('./public/images/profile/'+newFileName, function(err) {
            if (err){
                res.status(400)
                var message = 'File Upload Error.';
                return common.sendFullResponse(res, 300,{}, message);
            }
            // file uploaded
            db.query("UPDATE users SET picture = '"+ newFileName+"' WHERE id = ?", user_id, function(err) {
                if (err){
                    res.status(401);
                    var message = "Sorry! Error occurred in update profile.";
                    common.sendFullResponse(res, 300, bad_result, message);
                }
                var photo_url = config.server_image_path + newFileName;
                var good_result = {
                    photo: photo_url
                };
                var message = "update user profile successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            });
        });


    })
}
/* changed by dongjin */
