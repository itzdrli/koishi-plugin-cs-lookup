import { Context, Schema } from 'koishi'
import { } from 'koishi-plugin-puppeteer'

export const name = 'cs-lookup'
export const inject = {
  optional: ['puppeteer']
}

export interface Config {
  SteamWebAPIKey: string,
  useImg: boolean
}

export const Config: Schema<Config> = Schema.object({
  SteamWebAPIKey: Schema.string().description("Steam Web API Key from www.steamwebapi.com"),
  useImg: Schema.boolean().default(false).description("是否使用图片回复(需要puppeteer)")
})

export const usage = `
<h1> This plugin requires a SteamWebAPI Key from <a href="https://www.steamwebapi.com">steamwebapi.com</a></h1>
<h1> 本插件需要来自 <a href="www.steamwebapi.com">steamwebapi.com</a> 的SteamWebAPI Key</h1>
`

export function apply(ctx: Context, config: Config) {
  ctx.command('cs-inv <steamId>', '查看CS背包', { authority: 0 })
    .action(async ({ session }, steamId) => {
      const invUrl = 'https://www.steamwebapi.com/steam/api/inventory?key=' + config.SteamWebAPIKey + '&steam_id=' + steamId + '&game=csgo'
      const profUrl = 'https://www.steamwebapi.com/steam/api/profile?key=' + config.SteamWebAPIKey + '&steam_id=' + steamId
      try {
        const invData = await ctx.http.get(invUrl)
        const profData = await ctx.http.get(profUrl)
        let result = `玩家 ${profData.realname}(${steamId}) 的库存: \n`
        const itemMap = new Map<string, number>()
        let totalItemCount = 0
        for (const item of invData) {
          totalItemCount ++
          const itemName = item.marketname
          const itemCount = item.count
          itemMap.set(itemName, (itemMap.get(itemName) || 0) + itemCount)
        }

        for (const [itemName, itemCount] of itemMap.entries()) {
          result += `${itemName} 数量: ${itemCount}\n`
        }
        
        result += `总物品数: ${totalItemCount}`
        if (!config.useImg) return result
        else {
          result = result.replace(/\n/g, '<br>')
          const html = `
      <!DOCTYPE html>
      <html lang="en">

      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>

      <body class="bg-slate-900 bg-opacity-80" style="width: 650px">
          <div class="container mx-auto px-4 max-w-650 w-auto">
              <div class="bg-gray-800 rounded-lg shadow-lg p-8">
                  <div class="text-center mt-4">
                      <div class="text-lg font-bold text-white">${result}</div>
                  </div>
              </div>
          </div>
      </body>
      </html>
        `
        const image = await ctx.puppeteer.render(html)
        return image
        }
      } catch (error) {
        return error
      }
    })
}
