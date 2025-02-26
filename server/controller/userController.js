import sendMail from "../middlewares/sendMail.js"
import { User } from "../models/user.js"
import jwt from 'jsonwebtoken'

export const loginUser = async (req, res) => {
    try {
        const { email } = req.body

        let user = await User.findOne({ email })

        if (!user) {
            user = await User.create({
                email,
            })
        }

        const otp = Math.floor(Math.random() * 1000000);

        const verifyToken = jwt.sign({ user, otp }, process.env.JWT_Seckey,
            {
                expiresIn: '5m'
            }
        )

        await sendMail(email, "Ai Assistant", otp);

        res.json({
            message: "OTP Sent To Yout Email",
            verifyToken,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const verifyuser = async (req, res) => {
    try {
        const { otp, verifyToken } = req.body

        const verify = jwt.verify(verifyToken, process.env.JWT_Seckey)

        if (!verify)
            return res.status(400).json({
                message: "OTP Expired",
            })

        if (verify.otp !== otp) return res.status(400).json({
            message: "Invalid OTP",
        })
        const token = jwt.sign({ _id: verify.user._id }, process.env.JWT_LoginKey, {
            expiresIn: '5d',
        })
        res.json({
            message: "Logged in Succesfully",
            user: verify.user,
            token,
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        res.json(user)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}