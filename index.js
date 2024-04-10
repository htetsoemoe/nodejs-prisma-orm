import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import { z } from 'zod'

const app = express()
app.use(bodyParser.json()) // Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.

// Schema Validation with Prisma ORM
const ArticleCreateSchema = z.object({
    title: z.string().max(10),
    content: z.string().max(1000),
    state: z.enum(["DRAFT", "PUBLISHED"])
})

const prisma = new PrismaClient({
    log: ["query"]
}).$extends({
    query: {
        article: {
            create: ({ args, query }) => {
                args.data = ArticleCreateSchema.parse(args.data)
                return query(args)
            }
        }
    }

    // using for 'Computed fields'
    // result: {
    //     profile: {
    //         fullAddress: {
    //             need: {
    //                 name: true,
    //                 address: true,
    //                 phone: true
    //             },
    //             compute: (profile) => {
    //                 return `${profile.name} ${profile.address} ${profile.phone}`
    //             }
    //         },
    //     }
    // }
})

// Schema Validation with Prisma ORM
app.post('/users/:userId/articles', async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: parseInt(req.params.userId) }
        })
        const article = await prisma.article.create({
            data: {
                ...req.body,
                userId: user.id
            }
        })
        res.status(200).json(article)
    } catch (error) {
        res.status(403).json(error?.issues)
    }
})

// Diving deep into queries in prisma orm
app.get(`/users/:id/articles`, async (req, res) => {
    // Fetch all articles and profile of a specified user
    const user = await prisma.user.findFirst({
        where: {
            id: parseInt(req.params.id)
        },
        include: {
            articles: true,
            profile: true
        }
    })
    res.status(200).json(user)

    // Count articles of each user
    /*
    const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        articles: true
                    }
                }
            }
        })
    res.status(200).json(users)
    */

    // Delete 'DRAFT' state articles of a specified user
    /*
    const result = await prisma.user.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                articles: {
                    deleteMany: {
                        state: 'DRAFT'
                    }
                }
            }
        })
        res.status(200).json(result)
    */
})

// Computed fields
// app.get('/users', async (req, res) => {
//     const profile = await prisma.profile.findFirst()
//     res.status(200).json(profile)
// })

// app.post('/articles', async (req, res) => {
//     /*
//         await prisma.article.create({
//             data: req.body
//         })
//         res.json({
//             success: true,
//         })
//     */
//     await prisma.article.createMany({
//         data: req.body
//     })
//     res.json({ success: true })
// })

// app.get('/articles', async (req, res) => {
//     // 1.retrieve all articles
//     const articles = await prisma.article.findMany()
//     res.json(articles)
// })

// app.get('/articles/:id', async (req, res) => {
//     // 2.retrieve a particular article
//     const article = await prisma.article.findFirst({
//         where: {
//             id: +req.params.id
//         }
//     })
//     res.json(article)
// })

// app.get('/articles/state/:state', async (req, res) => {
//     // 3. retrieve articles based on a condition (fetch all articles in DRAFT state)
//     const articles = await prisma.article.findMany({
//         where: {
//             state: `${req.params.state}`
//         }
//     })
//     res.json(articles)
// })

// Pagination (/articles?skip=0&take=5)
// app.get('/articles/', async (req, res) => {
//     const result = await prisma.article.findMany({
//         skip: parseInt(req.query.skip),
//         take: parseInt(req.query.take)
//     })
//     res.status(200).json(result)
// })

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
// app.put('/articles/:ids', async (req, res) => {
//     //"1,2,3,4" => ["1", "2", "3", "4"] => [1,2,3,4]
//     const ids = req.params.ids.split(',').map(id => +id)

//     const updatedArticles = await prisma.article.updateMany({
//         where: {
//             id: {
//                 in: ids
//             }
//         },
//         data: req.body
//     })

//     res.json(updatedArticles) // updatedArticles are numbers of updated records
// })

// Delete Record with Prisma ORM
// app.delete('/articles/:id', async (req, res) => {
//     const deletedArticle = await prisma.article.delete({
//         where: {
//             id: +req.params.id
//         }
//     })
//     res.json(deletedArticle)

//     // delete all records
//     // const count = await prisma.article.deleteMany({})
//     // res.json(count)

// })

// Insert nested data 
// app.post('/users', async (req, res) => {
//     await prisma.user.create({
//         data: {
//             email: req.body.email,
//             articles: {
//                 create: req.body.articles
//             }
//         }
//     })
//     res.json({ success: true })
// })

// SQL native query in prisma orm
// app.get('/users/:userId/articles', async (req, res) => {
//     // const articles = await prisma.$queryRaw`SELECT * FROM articles WHERE userId = ${req.params.userId}`
//     const articles = await prisma.$queryRaw`SELECT * FROM articles INNER JOIN user ON articles.userId = user.id WHERE user.id = ${req.params.userId}`
//     res.json(articles)
// })

app.get('/', (req, res) => res.send("Hello, World!"))

app.listen(3500, () => console.log("Server is running on port 3500"))