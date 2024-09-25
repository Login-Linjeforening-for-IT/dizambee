// Used for type specification when recieving requests
import { Request, Response } from 'express'

// Imports the invalidateCache function from the flow module, used to invalidate
import { invalidateCache } from '../flow'

/**
 * Editing type, used for type specification when editing courses
 */
type Editing = {
    cards: Card[]
    texts: string[]
}

/**
 * Card type, used for type specification when creating cards
 */
type Card = {
    question: string
    alternatives: string[]
    correct: number[]
    source: string
    rating: number
    votes: number[]
    help?: string
    theme?: string
}

/**
 * Function used to update courses in the database
 * @param req Request object
 * @param res Response objecet
 * @returns Status code based on the outcome of the operation
 */
export async function putCourse(req: Request, res: Response) {
    // Wrapped in a try-catch block to handle potential errors gracefully
    try {
        // Destructures the courseID from the request parameters
        const { courseID } = req.params

        // Destructures relevant variables from the request body
        const { username, accepted, editing } = req.body as { username: string, accepted: Card[], editing: Editing }
        
        // Checks if required variables are defined, or otherwise returns a 400 status code
        if (!username || accepted === undefined || editing === undefined) {
            return res.status(400).json({ error: 'username, accepted, and editing are required' })
        }

        // Checks if the courseID is defined, or otherwise returns a 400 status code
        if (!courseID) {
            return res.status(400).json({ error: 'Course ID is required.' })
        }

        const courseRef = {
            id: null
        }

        // Returns a 200 status code with the id of the updated course
        res.status(200).json({ id: courseRef.id })
    } catch (err) {
        // Returns a 500 status code with the error message if an error occured
        const error = err as Error
        res.status(500).json({ error: error.message })
    }
}
