// Imports express to host the API
import express from 'express'

// Imports all GET handlers from the handlers folder
import { 
    getIndexHandler, 
    getHealthHandler,
    getGroups,
    getUsers,
    getUser,
    getTicket,
    getUserByMail
} from './handlers/get'

// Imports all POST handlers from the handlers folder
import { 
    postTicket,
    postUser, 
} from './handlers/post'

// Imports all PUT handlers from the handlers folder
import { 
    putCourse, 
} from './handlers/put'

// Imports all DELETE handlers from the handlers folder
import {
    deleteComment,
} from './handlers/delete'

// Creates a new express router
const router = express.Router()

// Defines all GET routes that are available on the API
router.get('/', getIndexHandler)
router.get('/health', getHealthHandler)
router.get('/groups', getGroups)
router.get('/users', getUsers)
router.get('/users/:userID', getUser)
router.get('/users/:mail', getUserByMail)
router.get('/tickets/:ticketID', getTicket)

// Defines all PUT routes that are available on the API
// router.put('/course/:courseID', putCourse)

// Defines all POST routes that are available on the API
router.post('/ticket', postTicket)
router.post('/users', postUser)

// Defines all DELETE routes that are available on the API
// router.delete('/comment', deleteComment)

// Exports the router
export default router
