import jwt from "@tsndr/cloudflare-worker-jwt"

import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "okta",
    verifyPath: "/oauth2/v1/token",
    createToken: async (authInfo, config) => {
        const user = jwt.decode(authInfo.id_token).payload

        return {
            provider: "okta",
            clientID: config.clientID,
            username: user.preferred_username,
            email: user.email,
            id: user.sub,
        }
    }
})
