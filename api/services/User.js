/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require("mongoose");
var lodash = require("lodash");
var objectid = require("mongodb").ObjectId;
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    designation: {
        type: String,
        default: ""
    },
    companyName: {
        type: String,
        default: ""
    },
    lineOfBusiness: {
        type: String,
        default: ""
    },
    officeAddress: {
        address: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        pincode: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        }
    },
    contactDetails: {
        mobileNumber: {
            type: String,
            default: ""
        },
        directLandline: {
            type: String,
            default: ""
        },
        boardLandline: {
            type: String,
            default: ""
        },
        extension: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        recordgps: {
            type: String,
            default: ""
        }
    },
    profilePicture: {
        type: String,
        default: ""
    },
    companyLogo: {
        type: String,
        default: ""
    },
    birthDate: {
        type: String,
        default: ""
    },
    anniversary: {
        type: String,
        default: ""
    },
    residentialAddress: {
        address: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        pincode: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        }
    },
    contactPersonalDetails: {
        mobileNumber: {
            type: String,
            default: ""
        },
        homeLandline: {
            type: String,
            default: ""
        },
        twitterhandle: {
            type: String,
            default: ""
        },
        facebookpage: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        recordgps: {
            type: String,
            default: ""
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    contacts: {
        type: [{
            name: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            contact: String,
            request: Boolean
        }],
        index: true
    },
    modificationDate: Date,
    contact: String
});
module.exports = mongoose.model("User", schema);
var Sample = mongoose.model("User", schema);
var model = {
    saveData: function(data, callback) {
        var user = this(data);
        this.findOne({
            contact: data.contact
        }).lean().exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
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
    getOne: function(data, callback) {
        this.findOne({
            _id: data._id
        }, {
            contacts: 0
        }).lean().exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found);
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
            data.contacts = lodash.uniqBy(data.contacts, "contact");
            if (1 == 1) {
                function callme(num) {
                    var abc = data.contacts[num];
                    User.saveData(abc, function(err, data4) {
                        if (err) {
                            console.log(err);
                        } else {
                            User.update({
                                _id: data._id
                            }, {
                                $push: {
                                    contacts: {
                                        name: data4.name,
                                        contact: data4.contact,
                                        user: data4._id
                                    }
                                }
                            }, function(err, saveres) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    num++;
                                    if (num == data.contacts.length) {
                                        User.getSpingrContacts({ _id: data._id }, function(err, respo) {
                                            if (err) {
                                                console.log(err);
                                                callback(err, null);
                                            } else {
                                                callback(null, respo);
                                            }
                                        });
                                    } else {
                                        callme(num);
                                    }
                                }
                            });
                        }
                    });
                }
                User.getSession({ _id: data._id }, function(err, myres) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (myres.contacts && myres.contacts.length > 0) {
                            data.contacts = lodash.differenceBy(data.contacts, myres.contacts, "contact");
                            console.log(data.contacts);
                            if (data.contacts && data.contacts.length > 0) {
                                callme(0);
                            } else {
                                User.getSpingrContacts({ _id: data._id }, function(err, respo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        callback(null, respo);
                                    }
                                });
                            }
                        } else {
                            callme(0);
                        }
                    }
                });
            }
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
                data.contact = contactno;
                callback(null, data);
            }
        });
    },
    editData: function(data, callback) {
        var user = data._id;
        delete data._id;
        tobechanged = {};
        var attribute = "contacts.$.";
        _.forIn(data, function(value, key) {
            tobechanged[attribute + key] = value;
        });
        User.update({
            _id: user,
            "contacts.user": data.req
        }, {
            $set: tobechanged
        }, function(err, updated) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, { message: "Updated" });
            }
        });
    },
    getme: function(data, callback) {
        User.find({
            _id: data._id,
            "contacts.user": data.user
        }, {
            "contacts.$": 1
        }).exec(function(err, data2) {
            if (data2 && data2[0] && data2[0].contacts && data2[0].contacts[0]) {
                callback(data2[0].contacts[0]);
            } else if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback({ comment: "No data found" }, null);
            }
        });
    },
    getContacts: function(data, callback) {
        User.findOne({
            _id: data._id
        }, {
            "contacts.user": 1
        }).populate("contacts.user", "_id companyName contact contactDetails name officeAddress profilePicture companyLogo designation lineOfBusiness", null, { sort: { "name": 1 } }).lean().exec(function(err, res) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (res.contacts && res.contacts.length > 0) {
                    callback(null, res.contacts);
                } else {
                    callback(null, []);
                }
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
                callback(null, res);
            }
        });
    },
    getSpingrContacts: function(data, callback) {
        User.findOne({
            _id: data._id,
            contacts: { $exists: true },
            $or: [{ "contacts.request": { $exists: false } }, { "contacts.request": { $eq: false } }]
        }, {
            "contacts.user": 1
        }).populate("contacts.user", "_id name companyName profilePicture", { _id: { $ne: data._id } }).lean().exec(function(err, res) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            } else {
                if (res && res.contacts && res.contacts.length > 0) {
                    res.contacts = lodash.remove(res.contacts, function(n) {
                        if (n.user) {
                            return n;
                        }
                    });
                    callback(null, res.contacts);
                } else {
                    callback(null, []);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, model);
