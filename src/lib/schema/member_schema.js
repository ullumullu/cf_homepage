/*=====================================
=            Member Schema            =
=====================================*/

var mongoose = require('mongoose');

var memberSchema = mongoose.Schema({
        visible: { type: Boolean, default: true },
        name: String,
        age: Number,
        description: String,
        member_status: String,
        hasImg: { type: Boolean, default: false },
        color: String,
        activities: Object
});

module.exports = memberSchema;