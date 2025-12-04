import Fastify from 'fastify'
import apiRoutes from './routes.ts'
import cors from '@fastify/cors'
import { getIndexHandler } from './handlers/get.ts'

// Creates the Fastify instance with logging enabled.
const fastify = Fastify({
    logger: true
})

// Registers the cors configuration, the defined methods are allowed, while all
// others will be dropped.
fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
})

// Prefixes all routes with `/api` and defines the root (`/`) handler
fastify.register(apiRoutes, { prefix: '/api' })
fastify.get('/', getIndexHandler)

/**
 * Starts the API on the defined port, listening to all interfaces. This port is
 * only internal in the container. The external port can be changed using the
 * `API_PORT` environment variable.
 */
async function start() {
    try {
        await fastify.listen({ port: 8080, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

// Starts the API
start()
