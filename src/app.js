import express from 'express';

import userRouter from "./routes/users.router.js"

const app = express()

const port = 3000

app.use(express.json());

app.use("/users", userRouter);

app.get('/', (req, res)=> {
    res.send('hello world');
});

app.listen(port, () => {
    console.log(`예시 실행 ${port}`);
})