/**
 * Created by OliveTech on 10/27/2017.
 */
/**
 * Created by OliveTech on 10/26/2017.
 */
var common = require("../config/common")
var config = require('../config/config')
var db = require('../config/database')
var jwt = require("jsonwebtoken")


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

function sendHistory(req, res, room_id, last_message_id, callback){
    var sql = 'SELECT * FROM bz_messages WHERE room_id = ? and id > ? ORDER BY created ASC';
    var filter = [room_id, last_message_id];
    db.query(sql, filter, function(err, result) {
        if (err){
            res.status(401);
            var message = "Sorry! Error occurred in Database.";
            common.sendFullResponse(res, 300, bad_result, message);
        }
        var good_result = {
            room_id : room_id,
            history : result
        };
        var message = "get user profile successfully.";
        common.sendFullResponse(res, 200, good_result, message);
    });
}

exports.sendMessage = function(req, res){
    checkAudentication(req, res, function(user_id) {

        var bad_result = {};
        if (req.body.room_id == undefined) {
            var message = "Sorry! Error occurred in send message.";
            common.sendFullResponse(res, 300,bad_result, message);
        }
        // insert message to database
        var room_id = req.body.room_id;
        var chat_message = req.body.message;
        var media_type = req.body.media_type;
        var group_id = req.body.group_id;
        var is_attach = req.body.is_attach;

        if(media_type != "chat"){
            // file upload
            var message = "Sorry! Error occurred in send message.";
            common.sendFullResponse(res, 300, bad_result, message);
        }else{
            var created = Date.now();
            var sql = 'INSERT INTO bz_messages(room_id, group_id, user_id, message, media_type, media, created) VALUES ( ? ) ';
            var values = [ room_id, group_id, user_id, chat_message, media_type, '', created];
            db.query( sql, [values], function(err, result){
                if (err){
                    res.status(401);
                    var message = "Sorry! Error occurred in Database.";
                    common.sendFullResponse(res, 300, bad_result, err);
                }
                var good_result = {
                    id : result.insertId,
                    room_id : room_id,
                    group_id : group_id,
                    message : chat_message,
                    media_type : media_type,
                    media : "",
                    state : 0,
                    created : created
                };
                var message = "Message send successfully."
                common.sendFullResponse(res, 200, good_result, message)
            })
        }

    })
}

exports.getHistory = function(req, res) {
    checkAudentication(req, res, function(user_id) {

        var bad_result = {};
        if (req.body.room_id == undefined) {
            var message = "Sorry! Error occurred in get message history.";
            common.sendFullResponse(res, 300,bad_result, message);
        }
        var room_id = req.body.room_id;
        var last_message_id = req.body.last_message_id;
        var receiver_id = req.body.receiver_id;
        if( room_id > 0 ){
            // get history
            sendHistory(req, res, room_id, last_message_id)
        }else{
            var sql = 'SELECT * FROM bz_rooms WHERE (sender_id = ? and receiver_id = ?) or (sender_id = ? and receiver_id = ?)';
            var filter = [user_id, receiver_id, receiver_id, user_id];
            db.query(sql, filter, function(err, result) {
                if (err){
                    res.status(401);
                    var message = "Sorry! Error occurred in Database.";
                    common.sendFullResponse(res, 300, bad_result, message);
                }
                if(result.length == 0){
                    // create new room
                    var values = [user_id, receiver_id, Date.now().toString()];
                    db.query('INSERT INTO bz_rooms(sender_id, receiver_id, created) VALUES ( ? ) ', [values], function(err, result){
                        if (err){
                            res.status(401);
                            var message = "Sorry! Error occurred in Database1.";
                            common.sendFullResponse(res, 300, bad_result, err);
                        }
                        var good_result = {
                            room_id : result.insertId,
                            history : {}
                        };
                        var message = "get chat history successfully."
                        common.sendFullResponse(res, 200, good_result, message)
                    })
                }else{
                    sendHistory(req, res, result[0].id, last_message_id)
                    // res.status(401);
                    // var message = "Sorry! Error occurred in create new room.";
                    // common.sendFullResponse(res, 300, bad_result, message);
                }
            });
        }
    })
}
exports.chatUserList = function(req, res) {
    var bad_result = {
        userList : []
    };
    if(!req.headers['token']){
        var message = 'There is no authenticate token.';
        console.log(token);
        common.sendFullResponse(res, 300,bad_result, message);
    }
    var token = req.headers['token']
    if (token) {
        jwt.verify(token, config.securty_key, function(err, decoded) {
            if (err) {
                var message = 'Failed to authenticate token.';
                console.log(message);
                common.sendFullResponse(res, 300,bad_result, message);
            } else {
                // get user list
                console.log(decoded)
                var good_result = {
                    username : decoded.username,
                    userList : []
                };
                var message = "";
                common.sendFullResponse(res, 200, good_result, message);
            }
        });

    } else {
        var message = 'No token provided.';
        console.log(token);
        common.sendFullResponse(res, 300,bad_result, message);
    }

};

/* changed by dongjin */
