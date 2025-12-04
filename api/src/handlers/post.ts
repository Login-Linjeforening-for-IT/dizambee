import { API, TOKEN } from './env.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Posts a comment to the given course
 * @param req Request object
 * @param res Response object
 */
export async function postTicket(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const ticketData = req.body

    try {
        const response = await fetch(`${API}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            },
            body: JSON.stringify(ticketData)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.status(201).send(data.id)
    } catch (error) {
        console.error(`Error creating ticket: ${error}`)
        res.status(500).send({ error: 'An error occurred while creating the ticket.' })
    }
}

/**
 * Posts a comment to the given course
 * @param req Request object
 * @param res Response object
 */
export async function postUser(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const userData = req.body

    try {
        const response = await fetch(`${API}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            },
            body: JSON.stringify(userData)
        })

        if (!response.ok) {
            const data = await response.json()
            return res.status(response.status).send(data.error)
        }

        const data = await response.json()
        res.status(201).send(data.id)
    } catch (error) {
        console.log(`Error creating customer: ${error}`)
        res.status(500).send({ error: 'An error occurred while creating the customer.' })
    }
}
