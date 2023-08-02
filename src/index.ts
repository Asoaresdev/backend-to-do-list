import express, { Request, Response } from "express"
import { db } from "./database/knex"
import cors from "cors"
import { Tasks, User } from "./types"
import { type } from "os"

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log("servidor rodando na porta 3003");
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "pong" })
    } catch (error) {
        console.log(error);
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await db("users")
        res.status(200).send({ result: result })
    } catch (error) {
        console.log(error);
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body

        if (typeof id !== "string") {
            res.statusCode = 400
            throw new Error("id precisa ser uma string")
        }
        if (typeof name !== "string") {
            res.statusCode = 400
            throw new Error("name precisa ser uma string")
        }
        if (typeof email !== "string") {
            res.statusCode = 400
            throw new Error("email precisa ser uma string")
        }
        if (typeof password !== "string" || password.length < 6) {
            res.statusCode = 400
            throw new Error("password precisa ser uma string e conter pelo menos 6 carcteres")
        }
        const [validateEmail] = await db("users").where({ email: email })
        if (validateEmail) {
            res.statusCode = 400
            throw new Error("Email já cadastrado")
        }
        const [validateId] = await db("users").where({ id: id })
        if (validateId) {
            res.statusCode = 400
            throw new Error("id já cadastrado")
        }
        const newUser: User = {
            id,
            name,
            email,
            password
        }
        await db("users").insert(newUser)
        res.status(201).send("Usuário criado com sucesso")
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idDeleted = req.params.id

        if (typeof idDeleted !== "string") {
            res.statusCode = 400
            throw new Error("Id deve ser uma string")
        }
        const [validateId] = await db("users").where({ id: idDeleted })
        if (!validateId) {
            res.statusCode = 400
            throw new Error("id não cadastrado")
        }
        await db("users").del().where({ id: idDeleted })
        res.status(200).send("usuário deletado com sucesso")
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const result = await db("tasks")
        res.status(200).send({ result: result })
    } catch (error) {
        console.log(error);
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const { id, title, description } = req.body

        if (typeof id !== "string") {
            res.statusCode = 400
            throw new Error("id precisa ser uma string")
        }
        if (typeof title !== "string") {
            res.statusCode = 400
            throw new Error("name precisa ser uma string")
        }
        if (typeof description !== "string") {
            res.statusCode = 400
            throw new Error("email precisa ser uma string")
        }

        const [validateId] = await db("tasks").where({ id: id })
        if (validateId) {
            res.statusCode = 400
            throw new Error("id já cadastrado")
        }
        const newTask = {
            id,
            title,
            description
        }
        await db("tasks").insert(newTask)
        res.status(201).send("Task criada com sucesso")
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idUpdate = req.params.id
        const { id, title, description, status, createdAt } = req.body

        if (id && typeof id !== "string") {
            res.statusCode = 400
            throw new Error("id precisa ser uma string")
        }
        if (title && typeof title !== "string") {
            res.statusCode = 400
            throw new Error("name precisa ser uma string")
        }
        if (description && typeof description !== "string") {
            res.statusCode = 400
            throw new Error("email precisa ser uma string")
        }
        if (status && typeof status !== "number") {
            res.statusCode = 400
            throw new Error("status precisa ser number, sendo 0 para false e 1 para true")
        }

        const [validateTask] = await db("tasks").where({ id: idUpdate })

        if (!validateTask) {
            res.statusCode = 400
            throw new Error("id inválido, não cadastrado")
        }
        if (validateTask) {
            const updateTask: Tasks = {
                id: id || validateTask.id,
                title: title || validateTask.title,
                description: description || validateTask.description,
                created_at: createdAt || validateTask.created_at,
                status: status || validateTask.status
            }
            await db("tasks").update(updateTask).where({ id: idUpdate })
        }

        res.status(201).send({ message: "Task alterada com sucesso" })
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idDeleted = req.params.id

        if (typeof idDeleted !== "string") {
            res.statusCode = 400
            throw new Error("Id deve ser uma string")
        }
        const [validateId] = await db("tasks").where({ id: idDeleted })
        if (!validateId) {
            res.statusCode = 400
            throw new Error("id não cadastrado")
        }
        await db("tasks").del().where({ id: idDeleted })
        res.status(200).send("Task deletada com sucesso")
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users/:idUser/tasks/:idTask", async (req: Request, res: Response) => {
    try {
        const idUser = req.params.idUser
        const idTask = req.params.idTask

        if (typeof idUser !== "string") {
            res.statusCode = 400
            throw new Error("id precisa ser uma string")
        }
        if (typeof idTask !== "string") {
            res.statusCode = 400
            throw new Error("id precisa ser uma string")
        }

        const [validateIdUser] = await db("users").where({ id: idUser })
        const [validateIdTask] = await db("tasks").where({ id: idTask })
        if (!validateIdUser) {
            res.statusCode = 400
            throw new Error("id de usuário não encontrado")
        }
        if (!validateIdTask) {
            res.statusCode = 400
            throw new Error("id de task não encontrado")
        }
        const newUserTask = {
            user_id: idUser,
            task_id: idTask,
        }
        await db("users_tasks").insert(newUserTask)
        res.status(201).send({ message: "Task criada com sucesso" })
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/users/:idUser/tasks/:idTask", async (req: Request, res: Response) => {
    try {
        const idUser = req.params.idUser
        const idTask = req.params.idTask

        if (typeof idUser !== "string") {
            res.statusCode = 400
            throw new Error("Id deve ser uma string")
        }
        const [validateIdUser] = await db("users").where({ id: idUser })
        if (!validateIdUser) {
            res.statusCode = 400
            throw new Error("id não cadastrado em users")
        }
        const [validateIdTask] = await db("tasks").where({ id: idTask })
        if (!validateIdTask) {
            res.statusCode = 400
            throw new Error("id não cadastrado em tasks")
        }
        await db("users_tasks").del()
            .where({ user_id: idUser })
            .andWhere({ task_id: idTask })
        res.status(200).send({ message: "Usuário deletado da task com sucesso" })
    } catch (error) {
        console.log(error);

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks/users", async (req: Request, res: Response) => {
    try {
        const tasks = await db("tasks")

        const result = []

        for (let task of tasks) {
            const responsibles = []
            const users_tasks = await db("users_tasks").where({ task_id: task.id })

            for (let user_task of users_tasks) {
                const [user] = await db("users").where({ id: user_task.user_id })
                responsibles.push(user)
            }

            const newTaskWithUsers = {
                ...task,
                responsibles
            }

            result.push(newTaskWithUsers)
        }

        res.status(200).send(result)

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})