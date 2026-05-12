// const {verifyToken} = require('../service/jwtService.js')

// module.exports = (req, res, next) => {
//     const token = req.cookies.token;

//     if(!token){
//         return res.status(401).json({message: 'Not Authenticated'})
//     }

//     try{
//         const decoded = verifyToken(token)
//         req.userId = decoded.userId
//         next()
//     }catch(err){
//         res.status(401).json({message: 'Invalid Token'});
//     }
// }


const { verifyToken } = require('../service/jwtService.js');

module.exports = (req, res, next) => {
    // Support both "Bearer <token>" header and cookie (fallback)
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.token; // ← fallback for any existing sessions

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated — no token' });
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        const expired = err.name === 'TokenExpiredError';
        return res.status(401).json({
            message: expired ? 'Session expired — please log in again' : 'Invalid token',
        });
    }
};