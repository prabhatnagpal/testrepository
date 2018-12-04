console.log('Loading function');
const https = require("https");

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //console.log('value1 =', event.key1);
    //onsole.log('value2 =', event.key2);
    //console.log('value3 =', event.key3);
    //return event.key1;  // Echo back the first key value
    // throw new Error('Something went wrong');
   //string to JSON
   var final_temperature;
var longitude=77.3956003; //longitude from json file
var latitude=28.5312162;  //latitude from json file
//const url="https://api.darksky.net/forecast/b660bda1d96cc4ed5e84e9bffe2cb549/"+latitude+","+longitude; //url

 return new Promise((resolve, reject) => {
        const url="https://api.darksky.net/forecast/b660bda1d96cc4ed5e84e9bffe2cb549/"+latitude+","+longitude;

        const req = https.request(url, (res) => {

            
        let data = '';
// A chunk of data has been recieved.
res.on('data', (chunk) => {
data += chunk;
});
// The whole response has been received. Print out the result.
res.on('end', () => {
                var dat=JSON.parse(data); //String to JSON
				//extracting data required
		var weather='{"latitude":'+JSON.stringify(dat.latitude)+',"longitude":'+JSON.stringify(dat.longitude)+',"timezone":'+JSON.stringify(dat.timezone)+',"Weather_Summary":'+JSON.stringify(dat.currently.summary)+',"Temperature":'+JSON.stringify(dat.currently.temperature)+',"Icon":'+JSON.stringify(dat.currently.icon)+',"Humidity":'+JSON.stringify(dat.currently.humidity)+',"Windspeed":'+JSON.stringify(dat.currently.windSpeed)+'}';
				var temperature=JSON.parse(weather); //String to JSON
console.log(temperature);
final_temperature=temperature;

 resolve(temperature);
 return final_temperature;

});
}).on("error", (err) => {
  reject(err.message);
});

        // send the request
        req.write('');
        req.end();
    });
    
};
