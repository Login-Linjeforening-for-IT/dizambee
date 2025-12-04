import type { FastifyReply, FastifyRequest } from 'fastify'
import { API, TOKEN } from './env.ts'

export async function putTicket(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const ticketData = req.body
    const { ticketID, author, recipient } = req.params as { ticketID: string, author: string, recipient: string}
    const closeMessage = {
        "group_id": 37,
        "customer_id": 1,
        "article": {
            "body": `Closed by ${author || ''}.`,
            "type": "email",
            "internal": false,
            "to": recipient || ''
        },
        "priority_id": 2,
        "due_at": "2024-09-30T12:00:00Z",
        "state": "closed"
    }

    try {
        const response = await fetch(`${API}/tickets/${ticketID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            },
            body: JSON.stringify(author && recipient ? closeMessage : ticketData)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.status(201).send(data.id)
    } catch (error) {
        console.log(`Error creating ticket: ${error}`)
        res.status(500).send({ error: 'An error occurred while creating / updating the ticket.' })
    }
}
