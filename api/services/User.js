/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require("mongoose");
var lodash = require("lodash");
var Schema = mongoose.Schema;
var schema = new Schema({
    name: String,
    email: [String],
    image: String,
    gender: String,
    contact: String,
    dob: Date,
    marriage: Date,
    url: String,
    address: String,
    contacts: {
        type: [{
            name: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        index: true
    },
    profession: String,
    company: String,
    facebook: String,
    google: String,
    twitter: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    modificationDate: Date
});
module.exports = mongoose.model("User", schema);
var Sample = mongoose.model("User", schema);
var model = {
    saveData: function(data, callback) {
        var user = this(data);
        this.findOne({
            contact: data.contact
        }, function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // callback(null, data2);
                if (_.isEmpty(found)) {
                    user.save(function(err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, data2);
                        }
                    });
                } else {
                    callback(null, found);
                }
            }
        });
    },
    getSearch: function(data, callback) {
        var resultArr = [];
        var i = 0;
        User.findOne({
            _id: data._id,
            contacts: {
                $exists: true
            }
        }).populate("contacts.user").lean().exec(function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {

                if (data2 && data2.contacts && data2.contacts.length > 0) {
                    _.each(data2.contacts, function(a) {
                        i++;
                        if (a.user.profession && a.user.profession == data.search) {
                            var index = lodash.findIndex(resultArr, function(z) {
                                return z._id == a.user._id;
                            });
                            if (index == -1) {
                                if (a.user._id != data._id) {
                                    resultArr.push(a.user);
                                }
                            }
                        }
                        if (a.user.contacts && a.user.contacts.length > 0) {
                            function myCall(num) {
                                var b = a.user.contacts[num];
                                User.findOne({
                                    _id: b.user,
                                    profession: data.search
                                }).lean().exec(function(err, result) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if (result && result._id) {
                                            var index = lodash.findIndex(resultArr, function(z) {
                                                return z._id == result._id;
                                            });
                                            if (index == -1) {
                                                if (result._id != data._id) {
                                                    resultArr.push(result);
                                                }
                                            }
                                            num++;
                                            if (num == a.user.contacts.length) {
                                                if (i == data2.contacts.length) {
                                                    callback(null, resultArr);
                                                }
                                            } else {
                                                myCall(num);
                                            }
                                        } else {
                                            num++;
                                            if (num == a.user.contacts.length) {
                                                if (i == data2.contacts.length) {
                                                    callback(null, resultArr);
                                                }
                                            } else {
                                                myCall(num);
                                            }
                                        }
                                    }
                                });
                            }
                            myCall(0);
                        } else {
                            if (i == data2.contacts.length) {
                                callback(null, resultArr);
                            }
                        }
                    });
                } else {
                    callback(null, result);
                }
            }
        });
    },
    saveContacts: function(data, callback) {
        if (data.contacts && data.contacts.length > 0) {
            var i = 0;
            var contactarr = [];

            function callme(num) {
                var abc = data.contacts[num];
                User.saveData(abc, function(err, data4) {
                    if (err) {
                        console.log(err);
                    } else {
                        contactarr.push({
                            name: data4.name,
                            user: data4._id
                        });
                    }
                    num++;
                    if (num == data.contacts.length) {
                        User.editProfile({
                                _id: data._id,
                                // $push: {
                                //     contacts: contactarr
                                // }
                                // $addToSet: {
                                //     contacts: 'asddd'
                                // }
                                contacts: contactarr
                            },
                            function(err, saveres) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    // callback(null, contactarr);
                                    User.getSession({
                                        _id: data._id
                                    }, function(sess) {
                                        if (!sess.value) {
                                            callback(null, sess);
                                        } else {
                                            callback(null, {
                                                message: "user no"
                                            })
                                        }
                                    });
                                }
                            });
                    } else {
                        callme(num);
                    }
                });
            }
            callme(0);
        } else {
            callback(null, {
                message: "contacts not found"
            })
        }
    },


    syncContacts: function(data, callback) {
        if (data.contacts && data.contacts.length > 0) {
            var i = 0;
            var contactarr = [];

            function callme(num) {
                var abc = data.contacts[num];
                User.findOne({
                    contact: abc.contact,
                    modificationDate: {
                        $gt: new Date(abc.modificationDate)
                    }
                }, function(err, found) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (_.isEmpty(found)) {
                            num++;
                            if (num == data.contacts.length) {

                                callback(null, contactarr);

                            } else {
                                callme(num);
                            }
                        } else {
                            contactarr.push(found);
                            num++;
                            if (num == data.contacts.length) {

                                callback(null, contactarr);

                            } else {
                                callme(num);
                            }
                        }
                    }

                });
            }
            callme(0);

        } else {
            callback(null, {
                message: "contacts not found"
            })
        }
    },

    editProfile: function(data, callback) {
        var contactno = data.contact;
        delete data.contact;
        data.modificationDate = new Date();
        this.findOneAndUpdate({
            _id: data._id
        }, data, function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // callback(null, {
                //     message: "user updated"
                // });
                data.contact = contactno;
                callback(null, data);
            }
        });
    },

    getSession: function(data, callback) {
        User.findOne({
            _id: data._id
        }, function(err, res) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            } else {
                callback(res);
            }
        });
    },
};
module.exports = _.assign(module.exports, model);
