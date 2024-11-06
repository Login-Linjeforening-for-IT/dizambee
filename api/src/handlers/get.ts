// Used for type specification when recieving requests
import { Request, Response } from 'express'
import { get as levenshtein } from 'fast-levenshtein'
import dotenv from 'dotenv'

dotenv.config()

const { API, TOKEN } = process.env

/**
 * Base information about the api if the route was not specified
 * @param _ Request, not used
 * @param res Response, used to send the response to the user
 */
export async function getIndexHandler(_: Request, res: Response) {
    res.json({ message: "Welcome to the API!\n\nValid endpoints are:\n\n/ - Y" +
    "ou are here, this displays info about the API\n/scoreboard - Returns the" +
    " first 100 users on the scoreboard\n/courses - Returns a list of all cou" +
    "rses\n/courses/:courseID/reviewed - Returns a list of all reviewed flash" + 
    "cards\n/courses/:courseID/cards - Returns all cards, reviewed " +
    "or not\n/user/:username - Returns all info for every user" })
}

/**
 * Health check for the API
 * @param _ Request, not used
 * @param res Response, used to send the response to the user
 */
export async function getHealthHandler(_: Request, res: Response) {
    res.json(200)
}

export async function getGroups(_: Request, res: Response) {
    try {
        const response = await fetch(`${API}/groups`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })
        
        if (!response.ok) {
            const data = await response.json()
            
            res.status(response.status)
            res.json(data.error)
        }
        
        const data = await response.json()
        res.json(data)
    } catch (error) {
        console.log('bf5')
        res.status(500)
        res.json(error)
    }
}

export async function getUsers(_: Request, res: Response) {
    try {
        const response = await fetch(`${API}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
    
            res.status(response.status)
            res.json(data.error)
        }
    
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.status(500)
        res.json(error)
    }
}

export async function getUser(req: Request, res: Response) {
    const { userID } = req.params 
    
    try {
        const response = await fetch(`${API}/users/${userID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
    
            res.status(response.status)
            res.json(data.error)
        }
    
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.json(error)
    }
}

export async function getUserByMail(req: Request, res: Response) {
    const { mail } = req.params 
    
    try {
        const response = await fetch(`${API}/users/${mail}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
    
            res.status(response.status)
            res.json(data.error)
        }
    
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.json(error)
    }
}

export async function getTicket(req: Request, res: Response) {
    const { ticketID } = req.params

    try {
        const response = await fetch(`${API}/tickets/${ticketID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${TOKEN}`
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
    
            res.status(response.status)
            res.json(data.error)
        }
    
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.json(error)
    }
}

export async function getUserBySearch(req: Request, res: Response) {
    const { name } = req.params;

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
            });

            if (!response.ok) {
                const data = await response.json();
                res.status(response.status).json(data.error);
                return;
            }

            const data = await response.json();
            console.log('first page data', data)
            const users = data.users || [];

            if (users.length === 0) {
                break; // Exit if there are no more users
            }

            // Process each user to find the closest match
            for (const user of users) {
                const distance = levenshtein(user.name, name);
                if (distance <= 3 && distance < closestDistance) {
                    closestDistance = distance;
                    closestUser = user
                }
            }

            page++
        }

        // Return the closest match found
        if (closestUser) {
            res.json(closestUser);
        } else {
            res.status(404).json({ error: 'No user found matching the criteria.' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
}
