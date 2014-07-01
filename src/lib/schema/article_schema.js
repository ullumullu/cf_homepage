var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
    title:  String,
    title_short: String,
	author: String,
	author_edit: String,
	body:   String,
	abstract: String,
	comments: [{ body: String, date: Date }],
	date: { type: Date, default: Date.now },
	date_edit: Date,
	status: String,
	visibility: String,
	tags: [String],
	meta: {
		votes: Number,
	    favs:  Number
	},
	config: {
		publish_fb: Boolean,
		enablecomments: Boolean
	}

});

module.exports = articleSchema;