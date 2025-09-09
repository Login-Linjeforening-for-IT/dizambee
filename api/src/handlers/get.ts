// Used for type specification when recieving requests
import { get as levenshtein } from 'fast-levenshtein'
import dotenv from 'dotenv'
import { FastifyReply, FastifyRequest } from 'fastify'

dotenv.config()

const { API, TOKEN } = process.env

type Ticket = {
    id: number
    ticket_id: number
    type_id: number
    sender_id: number
    from: string
    to: string | null
    cc: string | null
    subject: string | null
    message_id: string | number | null
    message_id_md5: string
    in_reply_to: number | null
    content_type: string
    references: string | null
    body: string
    internal: boolean
    preferences: {
        delivery_article_id_related: number
        delivery_message: boolean
        notification: boolean
    },
    updated_by_id: number
    created_by_id: number
    created_at: string
    updated_at: string
    origin_by_id: null
    reply_to: string | number | null
    attachments: Attachment[]
    created_by: string
    updated_by: string
    type: string
    sender: string
    time_unit: any
}

type Attachment = {
    id: number
    store_file_id: number
    filename: string
    size: string
    preferences: [Object]
}

/**
 * Base information about the api if the route was not specified
 * @param _ Request, not used
 * @param res Response, used to send the response to the user
 */
export async function getIndexHandler(req: FastifyRequest, res: FastifyReply) {
    const routes = req.server.printRoutes({ commonPrefix: false })
    return res.send(`Welcome to the DiZamBee API!\n\nValid routes are:\n${routes}`)
}

/**
 * Health check for the API
 * @param _ Request, not used
 * @param res Response, used to send the response to the user
 */
export async function getHealthHandler(_: FastifyRequest, res: FastifyReply): Promise<any> {
    res.send(200)
}

export async function getGroups(_: FastifyRequest, res: FastifyReply): Promise<any> {
    try {
        const response = await fetch(`${API}/groups`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
}

export async function getUsers(_: FastifyRequest, res: FastifyReply): Promise<any> {
    try {
        const response = await fetch(`${API}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

export async function getUser(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const { userID } = req.params as { userID: string }

    try {
        const response = await fetch(`${API}/users/${userID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

export async function getTicket(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const { ticketID } = req.params as { ticketID: string }

    try {
        const response = await fetch(`${API}/tickets/${ticketID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

export async function getUserBySearch(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const { name } = req.params as { name: string }

    try {
        let page = 1
        const perPage = 20
        let closestUser = null
        let closestDistance = Infinity

        while (true) {
            const response = await fetch(`${API}/users?page=${page}&per_page=${perPage}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token token=${TOKEN}`
                }
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            const data = await response.json()
            const users = data.users || []

            if (users.length === 0) {
                break
            }

            // Process each user to find the closest match
            for (const user of users) {
                const distance = levenshtein(user.name, name)
                if (distance <= 3 && distance < closestDistance) {
                    closestDistance = distance
                    closestUser = user
                }
            }

            page++
        }

        // Return the closest match found
        if (closestUser) {
            res.send(closestUser)
        } else {
            res.status(404).send({ error: 'No user found matching the criteria.' })
        }
    } catch (error) {
        console.log(`Error fetching users: ${error}`)
        res.status(500).send({ error: 'An error occurred while fetching users.' })
    }
}

// Fetches all articles (messages) for a specific Zammad ticket
export default async function getTicketMessages(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const { ticketID, recipient } = req.params as { ticketID: string, recipient: string }

    try {
        // Fetches Zammad
        const response = await fetch(`${API}/ticket_articles/by_ticket/${ticketID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data)
        }

        const data = await response.json()

        // Early return if only checking recipient (Discord does not know the 
        // recipient when trying to send a reply, so we need to give it)
        if (recipient && recipient !== "false") {
            return res.send(data[0]?.to)
        }

        const isClosed = await checkStatus(ticketID)

        if (isClosed) {
            return res.send({ error: "closed" })
        }

        // Fetches all the messages from the ticket
        const result = data.reduce((acc: any, ticket: Ticket) => {
            if (!ticket.internal) {
                const attachments = ticket.attachments.map(attachment => {
                    return {
                        url: `${ticket.ticket_id}/${ticket.id}/${attachment.id}`,
                        name: attachment.filename
                    }
                })
                acc.push({ user: ticket.from, content: ticket.body, attachments })
            }

            return acc
        }, [])

        // Sends back the result
        res.send(result)
    } catch (error) {
        console.log(`Error fetching zammad messages for ticket ${ticketID}. Error: ${error}`)
        res.status(500).send({ error: `An error occured while fetching Zammad messages for ticket ${ticketID}. Error: ${error}` })
    }
}

// Fetches specified attachment
export async function getAttachment(req: FastifyRequest, res: FastifyReply): Promise<any> {
    const { id, ticket_id, attachment_id } = req.params as { id: string, ticket_id: string, attachment_id: string }
    const url = `${id}/${ticket_id}/${attachment_id}`

    try {
        // Fetches Zammad
        const response = await fetch(`${API}/ticket_attachment/${url}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        // Converts the stream to a base64 encoded string
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64String = buffer.toString('base64')
        res.send({ attachment: base64String })
    } catch (error) {
        console.log(`Error fetching Zammad attachment ${url}. Error: ${error}`)
        res.status(500).send({ error: `An error occurred while fetching Zammad attachment ${url}. Error: ${error}` })
    }
}

async function checkStatus(ticketID: string) {
    try {
        const response = await fetch(`${API}/tickets/${ticketID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()

        // state_id 4 = closed
        return data.state_id === 4
    } catch (error) {
        console.log(error)
        return false
    }
}
