import jwt from "@tsndr/cloudflare-worker-jwt"

import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "github",
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
        // const auth0Response = await fetch(
        //     new URL("/userinfo", config.origin),
        //     {
        //         headers: {
        //             "Authorization": `Bearer ${authInfo.access_token}`,
        //         }
        //     }
        // )

        // const user = await auth0Response.json()
        // console.log(JSON.stringify({user, authInfo}, null, 2))
        // return {
        //     provider: "auth0"
        // }
        // return {
        //     clientID: config.clientID,
        //     username: user.login,
        //     email: user.email,
        //     avatar: user.avatar_url,
        //     id: user.id,
        //     provider: "github",
        // }
    }
})
