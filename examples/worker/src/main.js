import { githubAuth } from "../../../lib/main.js"

export default {
    async fetch(request, env) {
        // Since a worker is just a function, call the auth directly and
        // handle the return value to act like middleware.
        const result = await githubAuth(
            { request, env },
            ["read:user", "user:email"]
        )
        if (result.res !== undefined) {
            return result.res
        }
        return Response.json(result.user)
    }
}
