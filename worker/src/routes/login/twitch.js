import jwt from "@tsndr/cloudflare-worker-jwt"

import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "twitch",
    verificationURL: "https://id.twitch.tv/oauth2/token",
    createToken: async (info, config) => {
        const { clientID } = config
        const userInfo = jwt.decode(info.id_token).payload

        const twitchInfo = await fetch(
            `https://api.twitch.tv/helix/users?id=${userInfo.sub}`,
            {
                headers: {
                    "Authorization": `Bearer ${info.access_token}`,
                    "Client-ID": clientID,
                }
            }
        )
        const twitchUser = await twitchInfo.json()
        // console.log(JSON.stringify(twitchUser, null, 2))
        const data = twitchUser.data[0]
        return {
            clientID,
            id: userInfo.sub,
            username: data.login,
            displayName: data.display_name,
            email: data.email,
            avatar: data.profile_image_url,
            token: {
                access: info.access_token,
                refresh: info.refresh_token,
                expire: Date.now() + (info.expires_in * 1000)
            }
        }
    }
})
