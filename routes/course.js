var express = require('express');
var router = express.Router();
var io = null;
var rooms = [];

const db = require('../db');

// find code of room with current client id
function findRoomCode(id) {
    for (let i = 0; i < rooms.length; i++) {
        if (id === rooms[i].id) {
            return rooms[i].code;
        }
    }
}

router.get('/:code', function(req, res, next) {

    if (!io) {
        io = require('socket.io')(req.connection.server);

        io.sockets.on('connection', (client) => {

            if (rooms.length !== 0) {
                rooms[rooms.length - 1].id = client.id;

                console.log(rooms);

                client.join(rooms[rooms.length - 1].code);

                console.log('a user has connected');
            }

            client.on('disconnect', () => {
                console.log('a user has disconected');

                // remove disconnected user id from rooms
                let id = client.id;
                for (let i = 0; i < rooms.length; i++) {
                    if (id === rooms[i].id) {
                        rooms.splice(i, 1);
                        break;
                    }
                }
            });

            client.on('chat message', (msg) => {
                //console.log('Message: ' + msg);

                db.query('select * from forbidden', (err, query) => {
                    if (err) {
                        console.log(err);
                    }

                    let hidden = false;
                    for (let i = 0; i < query.rows.length; i++) {
                        if (msg.toLowerCase().includes(query.rows[i].word)) {
                            console.log("izvrsilo se");
                            hidden = true;
                            break;
                        }
                    }

                    let code = findRoomCode(client.id);

                    db.query('insert into questions(course, question, visible) values ($1, $2, $3) returning id', [code, msg, !hidden], function (err, query2) {
                        if (err) {
                            console.error(err);
                        }

                        let qid = query2.rows[0].id;
                        io.to(code).emit('chat message', msg, qid, hidden);

                        //dbclient.end();
                    });
                });
            });

            client.on('like', (id) => {
                // find code of room with current client id
                let roomId = client.id;
                //console.log(client.id);
                let code = '';
                for (let i = 0; i < rooms.length; i++) {
                    if (roomId === rooms[i].id) {
                        code = rooms[i].code;
                        break;
                    }
                }

                let dbId = id.slice(4);

                db.query('update questions set like_count = like_count + 1 where id = $1', [dbId], function (err, query) {

                    db.query('select like_count from questions where id = $1', [dbId], function (err, query2) {

                        io.to(code).emit('like', { id: id, likes: query2.rows[0].like_count });

                        //dbclient.end();
                    });

                });

            });

            client.on('reply', ({ qid, text, lecturer }) => {

                let dbId = qid.slice(4);

                db.query('insert into replies(question, text) values ($1, $2)', [dbId, text], function (err, query) {
                    //console.log(text);
                    //dbclient.end();

                });

                io.emit('reply', { qid: dbId, text: text });

            });

            client.on('delq', ({ qid }) => {
                db.query('delete from questions where id = $1', [qid], (err, query) => {
                    if (err) {
                        console.log(err.stack);
                    }
                    let code = findRoomCode(client.id);
                    io.to(code).emit('delq', { qid: qid });
                    //dbclient.end();
                });
            });

            client.on('ansq', ({ qid }) => {
                db.query('update questions set answered = true, visible = true where id = $1', [qid], (err, query) => {
                    if (err) {
                        console.log(err.stack);
                    }
                    let code = findRoomCode(client.id);
                    io.to(code).emit('ansq', { qid: qid });
                    //dbclient.end();
                });
            });

            client.on('hideq', ({ qid }) => {
                db.query('update questions set visible = false where id = $1', [qid], (err, query) => {
                    if (err) {
                        console.log(err);
                    }
                    let code = findRoomCode(client.id);
                    io.to(code).emit('hideq', { qid: qid });
                    //dbclient.end();
                });
            });

        });
    }

    let code = req.params.code;

    let codeFormat = /^[0-9]+$/;

    if (codeFormat.test(code)) {

        //rooms.push({ code: req.params.code });
        
        db.query('select * from get_question_replies($1)', [code], function (err, query) {
            if (err) {
                console.error(err);
            }
            db.query('select * from courses where code = $1 and current_date <= enddate', [code], function (err, query2) {
                if (query2.rows.length === 0) {
                    res.send('This course does not exist.');
                    //client.end();
                } else {
                    let imgStr = '';
                    if (query2.rows[0].img) {
                        let json = query2.rows[0].img.toString();
                        let obj = JSON.parse(json);
                        let u8 = obj.buffer.data;
                        let b64 = Buffer.from(u8).toString("base64");
                        imgStr = "data:" + obj.mimetype + ";base64," + b64;
                    }
                    res.render('course', {
                        title: 'NeoSlido',
                        user: req.cookies.user,
                        course: {
                            code: code,
                            lecturer: query2.rows[0].lecturer,
                            title: query2.rows[0].title,
                            questions: query.rows,
                            img: imgStr
                        },
                        failed: false
                    });
                    rooms.push({ code: req.params.code }); // add code to rooms
                    //client.end();
                }
            });
        });

    } else {
        res.send('This course does not exist.');
    }
});

module.exports = router;
