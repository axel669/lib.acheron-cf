import { getCookie } from "hono/cookie"
import jwt from "@tsndr/cloudflare-worker-jwt"

export const $post = async (c) => {
    const log = c.get("log").child({ route: "/user" })
    const obol = getCookie(c, "obol")
    if (obol === undefined) {
        log.info("obol is null")
        return c.json(null)
    }

    log.info("obol is set")
    const { jwtSecret } = await c.req.json()
    const valid = await jwt.verify(obol, jwtSecret)
    if (valid === false) {
        return c.json(null)
    }
    const user = await jwt.decode(obol)
    return c.json(user.payload)
}
