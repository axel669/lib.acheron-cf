import jwt from "@tsndr/cloudflare-worker-jwt"
import { setCookie } from "hono/cookie"

/**
@param {{
    provider: string
    verificationURL: string
    createToken: (info: { access_token: string }) => Promise<object>
}} config
@return {void}
*/
export default (config) => {
    const { verificationURL, createToken, provider } = config
    return async (c) => {
        const info = await c.req.json()
        const url = new URL(c.req.url)
        const params = new URLSearchParams({
            "client_id": info.clientID,
            "client_secret": info.clientSecret,
            "code": info.code,
            "grant_type": "authorization_code",
            "redirect_uri": new URL(`./login/${provider}`, url.origin).href,
        })
        const authResponse = await fetch(
            `${verificationURL}?${params.toString()}`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                }
            }
        )
        const authInfo = await authResponse.json()

        if (authResponse.ok === false) {
            c.status(401)
            return c.json(authInfo)
        }

        const tokenData = await createToken(authInfo, info)

        const token = await jwt.sign(tokenData, info.jwtSecret)

        setCookie(
            c,
            "obol",
            token,
            {
                httpOnly: true,
                sameSite: "lax",
                expires: new Date(Date.now() + 691200000)
            }
        )
        return c.text("")
    }
}
