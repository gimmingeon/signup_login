import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

router.post('/sign-up', async (req, res) => {

    const { username, password, nickname, authorityName } = req.body;

    if (!username) {
        return res.status(400).json({ message: "이름을 입력하세요" });
    }

    if (!password) {
        return res.status(400).json({ message: "비밀번호를 입력하세요" });
    }

    if (!nickname) {
        return res.status(400).json({ message: "닉네임을 입력하세요" });
    }

    try {

        const existingNickname = await prisma.users.findFirst({
            where: { nickname }
        });

        if (existingNickname) {
            return res.status(400).json({ message: "이미 존재하는 닉네임입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,
                nickname,
                authorityName: authorityName || "ROLE_USER"
            }
        });

        return res.status(201).json({
            username : user.username,
            nickname : user.nickname,
            authorities : [{
                authorityName : user.authorityName
            }]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }

});

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({ message: "이름을 입력하세요" });
    }

    if (!password) {
        return res.status(400).json({ message: "비밀번호를 입력하세요" });
    }

    try {

        const user = await prisma.users.findFirst({
            where: { username }
        });

        if (!user) {
            return res.status(400).json({ message: "유저이름이 없습니다."});
        }

        const passwordMatch= await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({message: "비밀번호가 틀립니다."})
        }

        const accessToken = jwt.sign({ userId : user.userId }, process.env.ACCESS_TOKEN_SECRET, {expiresIn : "12h"})
        const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {maxAge: 7 * 24 * 60 * 60 * 1000});

        return res.status(201).json({
            accessToken: accessToken
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }

})

export default router;