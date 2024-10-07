export const onRequestGet = async (context) => {
    return Response.json(context.data.user)
}
