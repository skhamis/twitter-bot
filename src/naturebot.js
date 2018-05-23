const Twit = require('twit');
const request = require('request');
const fs = require('fs');
const config = require('./config.js');

// initialize
var client = new Twit(config);

//Get our photo of the day!
getPhotoOfTheDay();

function getPhotoOfTheDay() {
    const options = {
        uri: 'https://pixabay.com/api/',
        qs: {
            key: process.env.PIXABAY_KEY,
            q: 'nature',
            image_type: 'photo',
            per_page: 3,
        },
    };
    request.get(options, (err, response, body) => {
        body = JSON.parse(body);
        saveFile(body.hits[0], options, 'image.jpg');
    });
}

function saveFile(body, options, fileName) {
    const file = fs.createWriteStream(fileName);
    request(body.largeImageURL).pipe(file).on('close', err => {
        if(err) {
            console.log(err);
        } else {
            uploadMedia(body.tags, fileName);
        }
    });
}

function uploadMedia(tags, fileName) {
    client.postMediaChunked({
      file_path: fileName
    }, (err, data, response) => {
      if(err) {
        console.log(err);
      } else {
        console.log(data);
        const params = {
          status: tags,
          media_ids: data.media_id_string
        }
        postStatus(params);
      }
    });
}

function postStatus(params) {
  client.post('statuses/update', params, (err, data, response) => {
    if(err) {
      console.log(err);
    } else {
      console.log("status sucessfully posted");
    }
  });
}