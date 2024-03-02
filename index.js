import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

const app = express()
app.use(bodyParser.json()) // Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.

const prisma = new PrismaClient()

app.post('/articles', async (req, res) => {
    /*
        await prisma.article.create({
            data: req.body
        })
        res.json({
            success: true,
        })
    */
    await prisma.article.createMany({
        data: req.body
    })
    res.json({ success: true })
})

app.get('/', (req, res) => res.send("Hello, World!"))

app.listen(3500, () => console.log("Server is running on port 3500"))