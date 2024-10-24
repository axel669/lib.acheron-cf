import { deleteCookie } from "hono/cookie"

export const $any = (c) => {
    deleteCookie(c, "obol")
    return c.text("Logged Out")
}
