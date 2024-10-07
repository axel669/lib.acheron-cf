import { object, logLevel } from "@axel669/json-log"

export const $any = async (ctx, next) => {
    ctx.set(
        "log",
        object.logger.child({}, logLevel[ctx.env.log_level ?? "error"])
    )
    return await next()
}
