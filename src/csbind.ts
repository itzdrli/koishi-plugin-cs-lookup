import { Context } from "koishi";
import { isOnlyDigits } from "./cs-inv";

export async function bind(ctx: Context) {
  ctx.command('csBind <steamId>', '绑定 SteamId', { authority: 0 })
    .action(async ({ session }, steamId) => {
      const userid = session.userId
      const platform = session.platform
      if (!isOnlyDigits(steamId)) {
        return `提供正确的 SteamID 或者使用 getid 命令获取 SteamID`
      }
      const res = await ctx.database.get('cs_lookup', { userid, platform })
      if (res.length) {
        session.send(`用户 ${session.username}(${session.userId}) 已绑定 SteamID ${steamId}, 回复 ok 以进行替换，或者回复 cancel 取消替换`)
        const response = await session.prompt()
        if (response === 'cancel') {
          return `已取消替换 SteamID`
        } else if (response === 'ok') {
          await ctx.database.remove('cs_lookup', { userid, platform })
        } else {
          return `无效回复, 已取消操作`
        }
      }
      await ctx.database.create('cs_lookup', {
        id: `${userid}-${platform}`,
        steamId,
        userid,
        platform
      })
      return `已绑定 SteamID ${steamId} 到用户 ${session.username}(${userid} - ${platform})`
    })
}