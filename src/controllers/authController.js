import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt  from 'jsonwebtoken';
import sendOTPEmail from '../service/emailService.js';
import User from '../models/User.js';

dotenv.config({path:'.env'});



// Step 1: Send OTP
export const sendOtp = async (req, res) => {
  const { email  } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOTPEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};

// Step 2: Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < new Date) {
    return res.status(400).json({ message: 'Invalid  OTP' });
  }

  res.json({ message: 'OTP verified' });
};

// Step 3: Reset Password

// Change password by email
export const changePasswordByEmail = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Hash and update password
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  await user.save();

  return res.json({ message: 'Password updated successfully' });
};



export const register = async (req, res) => {
 const {name,email,password} = req.body;

 console.log(req.body);

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name,email, password:hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({name:user.name, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// check Loged in user


export const CheckLogedInUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ alreadyLoggedIn: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.json({ alreadyLoggedIn: false });

    res.json({ alreadyLoggedIn: true, user: { id: user._id} });
  } catch {
    res.json({ alreadyLoggedIn: false });
  }
};


export const logout = (req, res) => {
  res.json({ message: 'Logout Sucessful !' });
};


export const  ResendOTP = async (req, res) => {
  const { email  } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOTPEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};


export const GetUser =async(req,res)=>{
  const token = req.headers.authorization?.split('')[1];
  if(!token){
    return res.json({message:"no token"})
  }
  try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    res.json({username:decoded.name});

  } catch (error) {
    res.status(401).json({message:"invalid token"})
  }

}