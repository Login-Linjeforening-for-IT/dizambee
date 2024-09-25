// Used for type specification when recieving requests
import { Request, Response } from 'express'

// Imports the invalidateCache function from the flow module, used to invalidate 
// the cache, ensuring that the data served is up to date
import { invalidateCache } from '../flow'

/**
 *  Defines the DeleteCommentProps type, used for type specification when deleting comments
 */
type DeleteCommentProps = {
    courseID: string
    username: string
    commentID: number
}

/**
 * Function used to delete comments from the database
 * @param req Request object
 * @param res Response object
 * @returns Status code bsaed on the outcome of the operation
 */
export async function deleteComment(req: Request, res: Response) {
    try {
        // Destructures relevant variables from the request body 
        const { courseID, username, commentID } = req.body as DeleteCommentProps

        // Checks if required variables are defined, or otherwise returns a 400 status code
        if (!username || typeof commentID !== 'number') {
            return res.status(400).json({ error: 'Comment ID is required' })
        }

        const commentRef = {
            id: null
        }

        // Invalidates the cache to ensure that the data served is up to date
        invalidateCache(`${courseID}_comments`)

        // Returns a 200 status code with the id of the deleted comment
        res.status(200).json({ id: commentRef.id })
    } catch (err) {
        // Returns a 500 status code with the error message if an error occured
        const error = err as Error
        res.status(500).json({ error: error.message })
    }
}
