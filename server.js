const express = require('express');
const { port: PORT } = require('./config');
const cors = require('cors');
const HttpStatus = require('http-status-codes');
const logger = require('morgan');
const { connectMongoDB, redisClient } = require('./db');
const { userRouter, postController } = require('./controllers');
const { INTERNAL_SERVER_ERROR, RESOURCE_NOT_FOUND } = require('./constants');

const app = express();
const formatsLogger = app.get('env') === 'dev' ? 'dev' : 'short';

app.use(logger(formatsLogger))
    .use(cors())
    .use(express.json())
    .use('/api/users', userRouter)
    .use('/api/posts', postController)
    .use((req, res, next) => {
        res.status(HttpStatus.NOT_FOUND).json({ message: RESOURCE_NOT_FOUND });
    })
    .use((err, req, res, next) => {
        const {
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = INTERNAL_SERVER_ERROR,
        } = err;

        console.error(err);
        res.status(status).json({ message });
    })
    .listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
        connectMongoDB();
        redisClient.connect();
    });
