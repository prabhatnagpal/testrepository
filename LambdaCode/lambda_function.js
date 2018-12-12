const https = require("https");

module.exports.lambda_handler = async (event, context) => {
	var final_location;
	var latitude=event.latitude;
	var longitude=event.longitude;
	return new Promise((resolve, reject) => {
		var url_google="https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&key=AIzaSyBLvbHraQAuxplLf7JP-jloLz4_t_HKlUM";
		const req = https.request(url_google, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				var dat = JSON.parse(data);
				var length = dat.results[0].address_components.length;
				var country = JSON.stringify(dat.results[0].address_components[length-2].long_name);
				var state = JSON.stringify(dat.results[0].address_components[length-3].long_name);
				var city = JSON.stringify(dat.results[0].address_components[length-5].long_name);
				var google_location = '{ "City" :' +city+',"State" :' +state+',"Country" :' +country+'}';
				final_location=JSON.parse(google_location);
				resolve(final_location);
				return final_location;
			});
		}).on("error", (err) => {
		  reject(err.message);
		});
		req.write('');
		req.end();
	});
};
