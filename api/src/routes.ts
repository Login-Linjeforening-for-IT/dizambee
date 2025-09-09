// Imports all GET handlers from the handlers folder
import getTicketMessages, { 
    getIndexHandler, 
    getHealthHandler,
    getGroups,
    getUsers,
    getUser,
    getTicket,
    getUserByMail,
    getAttachment
} from './handlers/get'

// Imports all POST handlers from the handlers folder
import { 
    postTicket,
    postUser,
} from './handlers/post'

// Imports all PUT handlers from the handlers folder
import { 
    putTicket, 
} from './handlers/put'

// Imports all DELETE handlers from the handlers folder
import {
    closeTicket,
} from './handlers/delete'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * Defines the routes available in the API.
 * 
 * @param fastify Fastify Instance
 * @param _ Fastify Plugin Options
 */
export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // Defines all GET routes that are available on the API
    fastify.get('/', getIndexHandler)
    fastify.get('/health', getHealthHandler)
    fastify.get('/groups', getGroups)
    fastify.get('/users', getUsers)
    fastify.get('/users/:userID', getUser)
    fastify.get('/users/:mail', getUserByMail)
    fastify.get('/tickets/:ticketID', getTicket)
    fastify.get('/attachment/:id/:ticket_id/:attachment_id', getAttachment)
    fastify.get('/ticket/:ticketID/:recipient', getTicketMessages)

    // Defines all PUT routes that are available on the API
    fastify.put('/ticket/:ticketID', putTicket)
    fastify.put('/ticket/:ticketID/:author/:recipient', putTicket)

    // Defines all POST routes that are available on the API
    fastify.post('/ticket', postTicket)
    fastify.post('/users', postUser)

    // Defines all DELETE routes that are available on the API
    fastify.delete('/ticket/:ticketID/:author', closeTicket)
}
