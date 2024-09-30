/**
@typedef {{
    [name: string]: string
}} Environment Object with environment varaiables
@typedef {{
    username: string
    email: string
    id: string
    provider: string
}} User
*/
/**
@param {{
    request: Request
    env: Environment
}} context
@return {
    { user: User } | { res: Response }
}
*/

const providers = {
    github: "github",
    twitch: "twitch"
}
const providerURL = {
    [providers.github]: "https://github.com/login/oauth/authorize",
    [providers.twitch]: "https://id.twitch.tv/oauth2/authorize",
}
const integrationFunc = async (provider, context, scopes) => {
    const { request, env } = context

    const authURL = providerURL[provider]
    const url = new URL(request.url)

    const authConfig = {
        clientID: env[`${provider}_client_id`],
        clientSecret: env[`${provider}_client_secret`],
        jwtSecret: env.jwt_secret,
        code: url.searchParams.get("code")
    }

    if (authConfig.clientID === undefined) {
        return { res: new Response(
            "Client ID is not configured",
            { status: 401 }
        ) }
    }
    if (authConfig.clientSecret === undefined) {
        return { res: new Response(
            "Client Secret is not configured",
            { status: 401 }
        ) }
    }

    const params = JSON.stringify(authConfig)
    if (url.pathname.startsWith("/login/") === true) {
        const response = await env.acheron.fetch(
            new Request(
                url,
                {
                    method: "POST",
                    headers: request.headers,
                    body: params,
                }
            )
        )

        if (response.ok === false) {
            return { res: response }
        }

        const res = new Response(
            "",
            {
                headers: response.headers,
                status: 302,
            }
        )
        res.headers.set("location", url.origin)

        return { res }
    }
    const response = await env.acheron.fetch(
        new Request(
            `${url.origin}/user`,
            {
                method: "POST",
                headers: request.headers,
                body: params,
            }
        )
    )
    const user = await response.json()

    if (user === null) {
        const redirParams = new URLSearchParams({
            client_id: env[`${provider}_client_id`],
            scope: scopes.join(" "),
            redirect_uri: new URL(`./login/${provider}`, url.origin).href,
            response_type: "code",
        })
        const res = new Response(
            "",
            {
                status: 302,
                headers: {
                    location: `${authURL}?${redirParams.toString()}`
                }
            }
        )
        return { res }
    }

    return { user }
}

export const githubAuth = (context, scopes) =>
    integrationFunc(providers.github, context, scopes)
export const twitchAuth = (context, scopes) =>
    integrationFunc(providers.twitch, context, scopes)
