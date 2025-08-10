const axios = require('axios');

const axiosClient =  axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


module.exports = axiosClient;

