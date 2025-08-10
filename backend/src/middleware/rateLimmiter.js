const redisClient = require('../config/redis');

const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip;
        const currentTime = Math.floor(Date.now() / 1000); 
        const windowSize = 10; // 3-second window
        
        const key = `rate_limit:${ip}`;
        
        // Get the last request time for this IP
        const lastRequestTime = await redisClient.get(key);
        
        if (lastRequestTime) {
            const timeDiff = currentTime - parseInt(lastRequestTime);
            
            if (timeDiff < windowSize) {
                const waitTime = windowSize - timeDiff;
                return res.status(429).send(`Please wait ${waitTime} more seconds before making another request`);
            }
        }
        
        // Update the last request time in Redis with expiration
        await redisClient.set(key, currentTime.toString(), 'EX', windowSize);
        
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        console.error('Rate limiter error:', err);
        res.status(500).send("Internal server error");
    }
};

module.exports = rateLimiter;