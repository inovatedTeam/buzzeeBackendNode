/**
 * Created by OliveTech on 10/26/2017.
 */

var config;
var DB_HOST, DB_USER, DB_PASS, DB_NAME
    DB_HOST = "localhost"
    DB_USER = "root"
    DB_PASS = ""
    DB_NAME = "goomood_happydemy"

    // DB_HOST = "localhost"
    // DB_USER = "goomood_dongjin"
    // DB_PASS = "Chengge111!"
    // DB_NAME = "goomood_dev"

config = {
    securty_key : "goomoodchatappbuzzee",
    server_url : "http://development.happydemy.com:8443/",
    server_image_path : "http://development.happydemy.com:8443/user/",
    db_host : DB_HOST,
    db_user : DB_USER,
    db_pass : DB_PASS,
    db_name : DB_NAME
};

module.exports = config;