# Acheron
An auth system built for use with cloudflare workers and pages functions that
does all of the annoying logic and validation for various authentication
methods.

## Usage
To use acheron, you will need to deploy the worker that is distributed with the
library, or in the repo if thats more your speed. Each auth type will have its
own set of environment variables, documented with each type.

### Installing the Worker
The worker comes with all the configuration needed to deploy to cloudflare. If
you use something other than pnpm, change the build command in the wrangler.toml
file to use whichever package manager you have installed. Be sure to install the
dependencies before attempting to deploy, or the build will fail. The name of
the worker can be changed without causing problems, so long as the binding it's
used with has the correct name.

### Use in Pages Functions
`_middleware.js`
```js
// import the auth type you want to use (see list of supported types)
import { githubAuth } from "@axel669/acheron"

// recommended to place the auth in a middleware file in front of all the
// requests you want to secure, but the context object is the same for routes
// so the library could be used to secure specific routes instead.
export const onRequest = async (context, next) => {
    const result = await githubAuth(
        // pass the context as is
        context,
        // array of oidc scopes to request; check the provider for valid config
        ["openid", "profile", "email"]
    )
    // if the auth gives back a response object, it contains information on
    // redirecting for auth to work. recommended to simple return the response
    // but it is just a Response object and can be used as one.
    if (result.res !== undefined) {
        return result.res
    }
    // the auth worker returns the currently authenticated user if everything
    // is successful, save this however you need to.
    context.data.user = result.user
    return await context.next()
}
```

### Use in other Workers
```js
// import the auth type you want to use (see list of supported types)
import { githubAuth } from "@axel669/acheron"

export default {
    async fetch (request, env) {
        const result = await githubAuth(
            // pass the request and env to the auth function
            { request, env },
            // array of oidc scopes to request; check the provider for valid config
            ["openid", "profile", "email"]
        )
        // if the auth gives back a response object, it contains information on
        // redirecting for auth to work. recommended to simple return the response
        // but it is just a Response object and can be used as one.
        if (result.res !== undefined) {
            return result.res
        }
        // the auth worker returns the currently authenticated user if everything
        // is successful, save this however you need to.
        const user = result.user
        // your code using the results
    }
}
```

> If using Hono with CF Workers, the Context object from hono is not a valid
> argument for the function, instead use
> `{ request: context.req.raw, env: context.env }`

## Supported Auth Types + Env Vars
- Github `githubAuth`
    - github_client_id
    - github_client_secret
- Twitch `twitchAuth`
    - twitch_client_id
    - twitch_client_secret
- Auth0 `auth0Auth`
    - auth0_client_id
    - auth0_client_secret
    - auth0_origin
- Okta `oktaAuth`
    - okta_client_id
    - okta_client_secret
    - okta_origin
