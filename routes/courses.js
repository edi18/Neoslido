var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

const db = require('../db');

router.get('/', function(req, res, next) {
    
    db.query('select * from get_courses_info($1)', [req.cookies.user.email], function(err, query) {
        res.render('courses', { title: 'NeoSlido', user: req.cookies.user, courses: query.rows });
    });

});

router.post('/', (req, res, next) => {

    //console.log(req.body);

    let email = req.body.emails;
    let emailList = email.split(';');
    emailList = emailList.join(', ')

    let code = req.body.code;

    let transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS
        }
    });

    let mailOptions = {
        from: process.env.MAILER_USER,
        to: emailList,
        subject: 'Invite to NeoSlido course!',
        text: 'Your access code is #' + code
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.redirect('courses');

});

module.exports = router;