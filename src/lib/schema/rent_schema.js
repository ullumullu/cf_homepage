/*=====================================
=            Rent Schema            =
=====================================*/

var mongoose = require('mongoose');

var rentSchema = mongoose.Schema({
        accepted: { type: Boolean, default: false },
        name: String,
        type: Number,
        email: String,
        date: Date,
        request: String,
        accepted_by: { type: String, default: "Undefined" },
        supervision: { type: [String], default: ["Undefined"] },
        remarks: [{
          from: String,
          comment: String
        }],
        gcal_id: String
});

module.exports = rentSchema;