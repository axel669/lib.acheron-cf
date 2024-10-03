import { auth0Auth, twitchAuth, githubAuth, oktaAuth } from "../../lib/main.js"

const scopes = {
    github: [
        "read:user",
        "user:email",
    ],
    twitch: [
        "openid",
        "user:read:email",
        "user:read:follows",
        "channel:read:redemptions",
        "channel:read:subscriptions",
        "chat:read",
        "chat:edit",
        "channel:moderate",
        "channel:read:polls",
        "channel:manage:polls",
        "channel_feed_read",
        "channel_feed_edit",
        "channel:read:redemptions",
        "moderator:manage:announcements",
        "moderator:read:followers",
        "moderator:read:shield_mode",
        "moderator:manage:shield_mode",
        "moderator:read:shoutouts",
        "moderator:manage:shoutouts",
        "moderator:manage:chat_messages",
        "moderator:read:chat_settings",
        "moderator:manage:chat_settings",
    ],
    auth0: [
        "openid",
        "profile",
        "email",
    ],
    okta: [
        "openid",
        "profile",
        "email",
    ],
}
const func = {
    github: githubAuth,
    twitch: twitchAuth,
    auth0: auth0Auth,
    okta: oktaAuth,
}
// Change this to whichever provider you want to test
const provider = "twitch"

export const onRequest = async (context) => {
    const result = await func[provider](context, scopes[provider])
    if (result.res !== undefined) {
        return result.res
    }
    context.data.user = result.user
    console.log(context.data)
    return await context.next()
}
