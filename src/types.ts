export type User = {
    id: string,
    name: string,
    email: string,
    password: string,
}
export type Tasks = {
    id: string,
    title: string,
    description: string,
    created_at: string,
    status: number
}

export type UserTask = {
    user_id: string,
    task_id: string
}