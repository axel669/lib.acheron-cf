import jwt from "@tsndr/cloudflare-worker-jwt"
import { setCookie } from "hono/cookie"

const exchangeFunc = {
    query: (url, params) => fetch(
        `${url}?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    ),
    body: (url, params) => fetch(
        url,
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params,
        }
    )
}

/**
@param {{
    provider: string
    verifyPath: string
    createToken: (info: { access_token: string }) => Promise<object>
}} config
@return {void}
*/
export default (config) => {
    const { verifyPath, createToken, provider } = config
    return async (c) => {
        const info = await c.req.json()
        const url = new URL(c.req.url)
        // I could do successive calls with .add on the url, but this is nicer
        const params = new URLSearchParams({
            "client_id": info.clientID,
            "client_secret": info.clientSecret,
            "code": info.code,
            "grant_type": "authorization_code",
            "redirect_uri": new URL(`./login/${provider}`, url.origin).href,
        })
        const verifyURL = new URL(verifyPath, info.origin)
        const authResponse = await exchangeFunc[info.exchangeType](
            verifyURL.href,
            params
        )
        const authInfo = await authResponse.json()

        if (authResponse.ok === false || authInfo.error !== undefined) {
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
                secure: true,
                expires: new Date(Date.now() + 691200000)
            }
        )
        return c.text("")
    }
}
