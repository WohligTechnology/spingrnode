/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: function(req, res) {
        if (req.body) {
            User.saveData(req.body, function(err, data) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: data
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },
    getOne: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "") {
                User.getOne(req.body, function(err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: data
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Id"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    getSearch: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && req.body.search && req.body.search != "") {
                User.getSearch(req.body, function(err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: data
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Params"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },
    saveContacts: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body._id = req.session.user._id;
                User.saveContacts(req.body, function(err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        if (data._id) {
                            req.session.user = data;
                            res.json({
                                value: true,
                                data: {
                                    message: "contacts inserted"
                                }
                            });
                        } else {
                            res.json({
                                value: false,
                                data: data
                            });
                        }
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "User not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    syncContacts: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body._id = req.session.user._id;
                User.syncContacts(req.body, function(err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: data
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "User not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    getProfile: function(req, res) {
        if (req.session.user) {
            res.json({
                value: true,
                data: req.session.user
            });
        } else {
            res.json({
                value: false,
                data: {}
            });
        }
    },

    logout: function(req, res) {
        req.session.destroy(function(err) {
            if (err) {
                res.json({
                    value: false,
                    data: err
                });
            } else {
                res.json({
                    value: true,
                    data: {}
                });
            }
        });
    },

    editProfile: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body._id = req.session.user._id;
                User.editProfile(req.body, function(err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        req.session.user = data;
                        res.json({
                            value: true,
                            data: {
                                message: "user updated"
                            }
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "User not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },
};
