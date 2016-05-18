import ses from 'node-ses';
import sanitizeHtml from 'sanitize-html';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import PropertiesReader from 'properties-reader';

const server = global.server = express();
var properties = PropertiesReader('properties.txt');

server.set('port', (process.env.PORT || 5000));


var client = ses.createClient({key: properties.get('aws.key'), secret: properties.get('aws.secret')});
var urlencodedParser = bodyParser.urlencoded({extended: true});

server.post('/message', urlencodedParser, function (request, response) {
    var to = request.body.to;
    var subject = request.body.subject;
    var message = request.body.message;

    if (!to && !message) {
        response.status(400).end();
        return;
    }
    try {

        message = sanitizeHtml(message, {
            allowedTags: [],
            allowedAttributes: {}
        });
        var config = {
            to: to,
            from: properties.get('email.from'),
            subject: subject,
            message: message
        };
        console.log(config);
        client.sendEmail(config, function (err, data, res) {
            console.log('Email sent');
        });
    } catch (err) {
        console.log(err);
    }

    response.status(200).end();
});

server.listen(server.get('port'), () => {
    console.log('The server is running at http://localhost:' + server.get('port'));
    if (process.send) {
        process.send('online');
    }
});



