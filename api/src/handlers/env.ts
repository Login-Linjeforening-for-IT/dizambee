import dotenv from 'dotenv'

dotenv.config()

const { API, token } = process.env

if (!API || !token) {
    console.error("Missing API url or token.")
}

export { API, token }