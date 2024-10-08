import { Hono } from "hono"

import { githubAuth } from "../../../lib/main"

const app = new Hono()

// setup a hono middleware that can does the auth so that indivual routes
// don't need to worry about it. By not returning any values directly, any route
// can decide what it wants to do with the auth result.
app.use(
    async (ctx, next) => {
        const result = await githubAuth(
            { request: ctx.req.raw, env: ctx.env },
            ["read:user", "user:email"]
        )
        ctx.set("auth", result)
        return await next()
    }
)
// have the main know if someone is logged in, but not force a redirect.
app.get(
    "/",
    async (ctx) => {
        const result = ctx.get("auth")
        return ctx.json(result.user ?? null)
    }
)

// have a login route that does the redirection
app.get(
    "/login",
    async (ctx) => {
        const result = ctx.get("auth")
        if (result.res !== undefined) {
            return result.res
        }
        return ctx.json("logged in")
    }
)

// make sure the /login/* routes point to the auth so it can do its job
app.get(
    "/login/*",
    async (ctx) => {
        const result = ctx.get("auth")
        return result.res
    }
)

export default app
