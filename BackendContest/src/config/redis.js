const { createClient }  = require('redis');
require('dotenv').config();

const redisclient = createClient({
    username: 'default',
    password: 'MjfMwZiXBwB2LlOaFHoYlNHC6wBGgkPh',
    socket: {
        host: 'redis-17094.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 17094
    }
});

module.exports = redisclient;

