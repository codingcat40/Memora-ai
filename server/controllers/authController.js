const User = require('../models/userModel.js');
const {hashPassword, comparePassword} = require('../service/hashService.js');
const { generateToken, verifyToken } = require('../service/jwtService.js');

/** Same-site + HTTP-friendly in dev; cross-site HTTPS in production */
function buildAuthCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const forceSecure = process.env.COOKIE_SECURE === 'true';
    const secure = isProd || forceSecure;
    return {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure,
        sameSite: secure ? 'none' : 'lax',
    };
}

// controller function for creating user
exports.createUser = async (req, res) =>  {
    try{
        const {username, email, password} = req.body;
        if(!username || !email || !password){
            return res.status(400).json({message: 'One or more fields are empty'})

        }
        
        const existingUser = await User.findOne({username: username})
        if(existingUser){
            return res.status(409).json({
                message:  "Username already exists"
            });
        }

    
        const existingEmail = await User.findOne({email: email})
        if(existingEmail){
            return res.status(409).json({
                message: "provide email which is not in use."
            })
        }


        const hashedPassword = await hashPassword(password)

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        })

        const token = generateToken({userId: user._id});
        const cookieOpts = buildAuthCookieOptions();
        res.cookie('token', token, cookieOpts)



        res.status(201).json({message: 'User Registered successfully', userId: user._id})
       
    }
    catch(err){
        return res.status(500).json({message:  'Server error occured'})
    }
}



// login controller function

exports.login = async (req, res) => {
    try{
       
        const {username, password} = req.body;
        const user = await User.findOne({username:  username})
        if(!user){
            return res.status(401).json({
                message: "User does not exist"
            })
        }
        const checkPassword = await comparePassword(password, user.password)
        if(!checkPassword){
            return res.status(401).json({message: 'passwords do not match'})
        }

        const token = generateToken({userId: user._id})
        res.cookie('token', token, buildAuthCookieOptions())

        // res.status(200)
        return res.status(200).json({message: 'Login Successful', user:  {
            id:  user._id,
            username: user.username,
            email: user.email,
        }})
    }
    catch(err){
        res.status(500).json({message: 'Server error!'})
    }
}



exports.logout = async (req, res) => {
    try{
        const c = buildAuthCookieOptions();
        res.clearCookie('token', {
            httpOnly: c.httpOnly,
            path: c.path,
            secure: c.secure,
            sameSite: c.sameSite,
        })

        return res.status(200).json({message: "logout successful"})
    }
    catch(err){
        return res.status(500).json({message: "Logout failed"})
    }
}


exports.getUserData = async (req, res) => {

    try{
    const token = req.cookies.token

    if(!token){
        return res.status(200).json({user:null})
    }
    const decoded = verifyToken(token, process.env.JWT_SECRET)
    console.log(decoded)

    return res.status(200).json({
        user:{
            id:  decoded.userId,
        }
    })
}catch(err){
    return res.status(200).json({user: null})
}
}