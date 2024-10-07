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
@typedef {{
    request: Request
    env: Environment
}} Context
*/

const providers = {
    github: "github",
    twitch: "twitch",
    auth0: "auth0",
    okta: "okta",
}
const providerOriginDefault = {
    [providers.github]: "https://github.com",
    [providers.twitch]: "https://id.twitch.tv",
}
const providerPath = {
    [providers.github]: "/login/oauth/authorize",
    [providers.twitch]: "/oauth2/authorize",
    [providers.auth0]: "/authorize",
    [providers.okta]: "oauth2/v1/authorize",
}
const providerExchangeType = {
    [providers.github]: "query",
    [providers.twitch]: "query",
    [providers.auth0]: "body",
    [providers.okta]: "body"
}

/**
@param {string} provider
@param {Context} context
@param {string[]} scopes
@return {
    { user: User } | { res: Response }
}
*/
const integrationFunc = async (provider, context, scopes) => {
    const { request, env } = context

    const authURL = new URL(
        providerPath[provider],
        env[`${provider}_origin`] ?? providerOriginDefault[provider]
    )
    const url = new URL(request.url)

    if (url.searchParams.has("error") === true) {
        return { res: Response.json(
            {
                error: url.searchParams.get("error"),
                description: url.searchParams.get("error_description"),
            },
            { status: 401 }
        ) }
    }

    const authConfig = {
        clientID: env[`${provider}_client_id`],
        clientSecret: env[`${provider}_client_secret`],
        origin: authURL.origin,
        jwtSecret: env.jwt_secret,
        code: url.searchParams.get("code"),
        exchangeType: providerExchangeType[provider],
        appOrigin: env.app_origin ?? url.origin,
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
    if (authConfig.origin === undefined) {
        return { res: new Response(
            "Auth Origin is not configured and does not have a default",
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
            client_id: authConfig.clientID,
            scope: scopes.join(" "),
            redirect_uri: new URL(`./login/${provider}`, url.origin).href,
            response_type: "code",
            "state": Math.random().toString(16),
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

/**
@param {Context} context
@param {string[]} scopes
*/
export const githubAuth = (context, scopes) =>
    integrationFunc(providers.github, context, scopes)
/**
@param {Context} context
@param {string[]} scopes
*/
export const twitchAuth = (context, scopes) =>
    integrationFunc(providers.twitch, context, scopes)
/**
@param {Context} context
@param {string[]} scopes
*/
export const auth0Auth = (context, scopes) =>
    integrationFunc(providers.auth0, context, scopes)
/**
@param {Context} context
@param {string[]} scopes
*/
export const oktaAuth = (context, scopes) =>
    integrationFunc(providers.okta, context, scopes)
