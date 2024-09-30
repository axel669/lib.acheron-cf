import createLogin from "../../create-login.js"

export const $post = createLogin({
    provider: "github",
    verificationURL: "https://github.com/login/oauth/access_token",
    createToken: async (authInfo) => {
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
            username: user.login,
            email: user.email,
            avatar: user.avatar_url,
            id: user.id,
            provider: "github",
        }
    }
})
