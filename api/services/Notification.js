/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var mongoose = require("mongoose");
var lodash = require("lodash");
var Schema = mongoose.Schema;
var schema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
        this.count({
            to: data.to,
            from: data.from
        }).lean().exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found == 0) {
                    notification.save(function(err, data) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, data);
                        }
                    });
                } else {
                    callback(null, found);
                }
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
    sendNotification: function(data, callback) {
        if (data.request && data.request.length > 0) {
            async.each(data.request, function(noti, callback1) {
                Notification.saveData({
                    from: data._id,
                    to: noti._id
                }, function(err, respo) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        callback1(null, respo);
                    }
                });
            }, function(err) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    async.each(data.request, function(edit, callback2) {
                        User.editData({
                            _id: data._id,
                            req: edit._id,
                            request: true
                        }, function(err, editrespo) {
                            if (err) {
                                console.log(err);
                                callback2(err, null);
                            } else {
                                callback2(null, editrespo);
                            }
                        });
                    }, function(err) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, {
                                message: "Requests Sent"
                            });
                        }
                    });
                }
            });
        } else {
            callback(null, {
                message: "No to contact found"
            });
        }
    },
    findPending: function(data, callback) {
        Notification.find({
            to: data._id,
            status: "Pending"
        }).populate("from", "_id name contact companyName profilePicture").exec(function(err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, respo);
            }
        });
    },
    acceptShare: function(data, callback) {
        this.findOneAndUpdate({
            _id: data._id
        }, {
            status: "Accepted"
        }, function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                User.find({
                    _id: data.sessionid,
                    "contacts.user": data.user
                }, {
                    "contacts.$": 1
                }).exec(function(err, data2) {
                    function updateUser(matchobj, updateobj) {
                        User.update(matchobj, updateobj, function(err, updated) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                callback(null, {
                                    message: "Updated"
                                });
                            }
                        });
                    }
                    if (data2 && data2[0] && data2[0].contacts && data2[0].contacts[0]) {
                        data2[0].contacts.accepted = true;
                        var tobechanged = {};
                        var attribute = "contacts.$.";
                        _.forIn(data2[0].contacts, function(value, key) {
                            tobechanged[attribute + key] = value;
                        });
                        var mobj = {
                            _id: data.sessionid,
                            "contacts.user": data.user
                        };
                        var uobj = {
                            $set: tobechanged
                        }
                        updateUser(mobj, uobj);
                    } else if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        var mobj = {
                            _id: data.sessionid
                        };
                        var uobj = {
                            $addToSet: {
                                contacts: {
                                    name: data.name,
                                    contact: data.contact,
                                    user: data.user,
                                    accepted: true
                                }
                            }
                        };
                        updateUser(mobj, uobj);
                    }
                });
            }
        });
    },
    getNewsLetter: function(data, callback) {
        async.parallel({
            pending: function(cb) {
                Notification.find({
                    to: data._id,
                    status: "Pending"
                }).populate("from", "_id name contact companyName profilePicture").lean().exec(function(err, respo) {
                    cb(err, respo);
                });
            },
            accepted: function(cb) {
                Notification.find({
                    from: data._id,
                    status: "Accepted"
                }).populate("to", "_id name contact companyName profilePicture").lean().exec(function(err, respo) {
                    cb(err, respo);
                });
            }
        }, function(error, result) {
            if (error) {
                console.log(error);
                callback(error, null);
            } else {
                var resArr = [];
                if (result.pending && result.pending.length > 0) {
                    _.each(result.pending, function(n) {
                        n.obj = lodash.cloneDeep(n.from);
                        delete n.from;
                        console.log(n);
                        resArr.push(n);
                    })
                }
                if (result.accepted && result.accepted.length > 0) {
                    _.each(result.accepted, function(n) {
                        n.obj = lodash.cloneDeep(n.to);
                        delete n.to;
                        resArr.push(n);
                    })
                }
                callback(null, resArr);
            }
        })
    },
    addAndShare: function(data, callback) {
        var shareObj = {
            request: [{
                _id: data.user
            }],
            _id: data.sessionid
        };
        async.parallel([
            function(cb) {
                Notification.acceptShare(data, function(error, respo) {
                    if (error) {
                        console.log(error);
                        cb(err, null);
                    } else {
                        cb(null, respo);
                    }
                });
            },
            function(cb) {
                Notification.sendNotification(shareObj, function(error, respo) {
                    if (error) {
                        console.log(error);
                        cb(err, null);
                    } else {
                        cb(null, respo);
                    }
                });
            }
        ], function(err, result) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, result)
            }
        });
    },
    deleteAll: function(data, callback) {
        Notification.remove({}, function(err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, {
                    message: "Deleted"
                });
            }
        });
    }
};
module.exports = _.assign(module.exports, model);
