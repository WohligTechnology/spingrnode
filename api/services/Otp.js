/**
 * Otp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var schema = new Schema({
    contact: String,
    otp: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
var d = new Date();
d.setMinutes(d.getMinutes() - 10);
module.exports = mongoose.model("Otp", schema);
var model = {
    saveData: function(data, callback) {
        var otp = this(data);
        otp.otp = (Math.random() + "").substring(2, 8);
        this.count({
            contact: data.contact
        }, function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // callback(null, data2);
                if (found == 0) {
                    otp.save(function(err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {

                            callback(null, {message: "OTP generated"});

                        }
                    });
                } else {
                    data.timestamp = new Date();
                    data.otp = (Math.random() + "").substring(2, 8);
                    this.findOneAndUpdate({
                        contact: data.contact
                    }, data, function(err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {

                            callback(null, {message: "OTP updated"});
                        }
                    });
                }
            }
        });
    },


    checkOtp: function(data, callback) {
        Otp.findOne({
            contact: data.contact,
            otp: data.otp,
            timestamp: {
                $gte: d
            }
        }, function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (data2 != null) {
                    User.saveData(data, function(err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(err, data3);
                        }
                    });

                } else {
                    callback(null, {
                        message: "OTP expired"
                    });
                }
                // callback(null, data2);
            }
        });
    },
};
module.exports = _.assign(module.exports, model);
