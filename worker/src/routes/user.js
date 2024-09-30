import { getCookie } from "hono/cookie"
import jwt from "@tsndr/cloudflare-worker-jwt"

export const $post = async (c) => {
    const obol = getCookie(c, "obol")
    if (obol === undefined) {
        return c.json(null)
    }

    const { jwtSecret } = await c.req.json()
    const valid = await jwt.verify(obol, jwtSecret)
    if (valid === false) {
        return c.json(null)
    }
    const user = await jwt.decode(obol)
    return c.json(user.payload)
}
