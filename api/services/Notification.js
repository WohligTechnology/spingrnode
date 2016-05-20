/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var schema = new Schema({
    from: String,
    to: String,
    status: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", schema);
var model = {
    saveData: function(data, callback) {
        var notification = this(data);
        notification.status = "Pending";
        notification.save(function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    },
    getAll: function(data, callback) {
        var returns = {};
        returns.send = [];
        returns.recieve = [];
        async.parallel([
            function(callback) {
                Notification.find({
                    from: data.user
                    // status: "Pending"
                }, function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            returns.send = data2;
                            callback(null, returns);
                        } else {
                            callback(null, returns);
                        }
                    }
                });
            },
            function(callback) {
                Notification.find({
                    to: data.user
                    // status: "Pending"
                }, function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            returns.recieve = data2;
                            callback(null, returns);
                        } else {
                            callback(null, returns);
                        }
                    }
                });
            }
        ], function(err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, returns);
            }
        });
    },

    editNotifications: function(data, callback) {
        data.timestamp = new Date();
        this.findOneAndUpdate({
            _id: data._id
        }, data, function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    },
};
module.exports = _.assign(module.exports, model);
