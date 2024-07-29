import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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

})

export default router;