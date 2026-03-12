const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/occupy.jpg");
https.get("https://drive.google.com/uc?export=download&id=1gyvqFYuIaiWOlsWcjRs6aKJyCc4kR0Mj", function(response) {
  if (response.statusCode === 302 || response.statusCode === 303) {
    https.get(response.headers.location, function(response2) {
      response2.pipe(file);
      file.on('finish', function() {
        file.close();
        console.log("Downloaded");
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log("Downloaded");
    });
  }
});
