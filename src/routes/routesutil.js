// STATIC VARIABLES
var JSONPREFIX = ")]}',\n";

//Takes care to add the security prefix as well as stringify the json content
module.exports.sendJson = function(request, response, body) {
	var resp_body = JSONPREFIX + JSON.stringify(body);
	response.send(resp_body);
} ;