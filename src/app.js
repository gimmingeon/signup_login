import express from 'express';
import userRouter from "./routes/users.router.js"
import cookieParser from 'cookie-parser';

const app = express()

const port = 3000

app.use(express.json());
app.use(cookieParser());

app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`예시 실행 ${port}`);
})

export default app;