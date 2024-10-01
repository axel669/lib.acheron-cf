import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "github",
    verifyPath: "/login/oauth/access_token",
    createToken: async (authInfo, config) => {
        const githubResponse = await fetch(
            "https://api.github.com/user",
            {
                headers: {
                    "Authorization": `Bearer ${authInfo.access_token}`,
                    "user-agent": "Acheron Cloudflare Auth"
                }
            }
        )

        const user = await githubResponse.json()
        return {
            clientID: config.clientID,
            username: user.login,
            email: user.email,
            avatar: user.avatar_url,
            id: user.id,
            provider: "github",
        }
    }
})
