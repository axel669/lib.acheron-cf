import jwt from "@tsndr/cloudflare-worker-jwt"

import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "auth0",
    verifyPath: "/oauth/token",
    createToken: async (authInfo, config) => {
        const user = jwt.decode(authInfo.id_token).payload

        return {
            provider: "auth0",
            clientID: config.clientID,
            username: user.nickname,
            email: user.email,
            id: user.sub,
            avatar: user.picture,
        }
    }
})
