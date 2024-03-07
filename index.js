import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

const app = express()
app.use(bodyParser.json()) // Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.

const prisma = new PrismaClient({
    log: ["query"]
})

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

app.get('/articles', async (req, res) => {
    // 1.retrieve all articles
    const articles = await prisma.article.findMany()
    res.json(articles)
})

app.get('/articles/:id', async (req, res) => {
    // 2.retrieve a particular article
    const article = await prisma.article.findFirst({
        where: {
            id: +req.params.id
        }
    })
    res.json(article)
})

app.get('/articles/state/:state', async (req, res) => {
    // 3. retrieve articles based on a condition (fetch all articles in DRAFT state)
    const articles = await prisma.article.findMany({
        where: {
            state: `${req.params.state}`
        }
    })
    res.json(articles)
})

// Update Single Record with Prisma ORM
// app.put('/articles/:id', async (req, res) => {
//     const updatedArticle = await prisma.article.update({
//         where: {
//             id: +req.params.id
//         },
//         data: req.body
//     })
//     res.json(updatedArticle)
// })

// Update Multiple Records with Prisma ORM
app.put('/articles/:ids', async (req, res) => {
    //"1,2,3,4" => ["1", "2", "3", "4"] => [1,2,3,4]
    const ids = req.params.ids.split(',').map(id => +id)

    const updatedArticles = await prisma.article.updateMany({
        where: {
            id: {
                in: ids
            }
        },
        data: req.body
    })

    res.json(updatedArticles) // updatedArticles are numbers of updated records
})

// Delete Record with Prisma ORM
app.delete('/articles/:id', async (req, res) => {
    const deletedArticle = await prisma.article.delete({
        where: {
            id: +req.params.id
        }
    })
    res.json(deletedArticle)

    // delete all records
    // const count = await prisma.article.deleteMany({})
    // res.json(count)

})

// Insert nested data 
app.post('/users', async (req, res) => {
    await prisma.user.create({
        data: {
            email: req.body.email,
            articles: {
                create: req.body.articles
            }
        }
    })
    res.json({ success: true })
})

app.get('/', (req, res) => res.send("Hello, World!"))

app.listen(3500, () => console.log("Server is running on port 3500"))