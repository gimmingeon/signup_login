import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function (req, res, next) {
    try {
        const authorization = req.headers.authorization;
        const refreshToken = req.cookies.refreshToken;

        if (!authorization && !refreshToken) {
            return res.status(401).json({ message: '인증 정보가 올바르지 않습니다.' });
        }

        if (authorization) {
            const [tokenType, token] = authorization.split(" ");
            if (tokenType !== "Bearer" || !token) {
                return res.status(401).json({ message: '토큰 타입이 일치하지 않습니다.' });
            }

            try {
                const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                res.locals.user = await prisma.users.findFirst({ where: { userId: decodedToken.userId } });
                return next();
            } catch (err) {
                if (err.name === 'TokenExpiredError' && refreshToken) {
                    try {
                        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                        const user = await prisma.users.findFirst({ where: { userId: decodedRefreshToken.userId } });

                        if (user) {
                            const newAccessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });
                            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                            res.locals.user = user;
                            return next();
                        }
                    } catch (refreshError) {
                        return res.status(401).json({ message: "리프레시 토큰이 유효하지 않습니다." });
                    }
                }
                return res.status(401).json({ message: '액세스 토큰이 유효하지 않습니다.' });
            }
        }

        return res.status(401).json({ message: '리프레시 토큰이 없습니다.' });

    } catch (error) {
        return res.status(500).json({ message: '서버 오류' });
    }
}
