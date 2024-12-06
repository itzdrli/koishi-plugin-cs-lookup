import { Context } from 'koishi'
import { Config, umami } from './index'
import { } from 'koishi-plugin-puppeteer'
import { } from 'koishi-plugin-umami-statistics-service'

export const light = ['#81a1c1', '#ffffff', '#5e81ac']
export const dark = ['#2e3440', '#ffffff', '#434c5e']

export function isOnlyDigits(str: string): boolean {
  return /^\d+$/.test(str);
}

export function inv(ctx: Context, config: Config) {
  const umamiD = umami;
  ctx.command('cs-inv [steamId]', '查看CS背包', { authority: 0 })
    .action(async ({ session }, steamId) => {
      if (config.data_collect) {
        ctx.umamiStatisticsService.send({
          dataHostUrl: umamiD[1],
          website: umamiD[0],
          url: '/cs-inv',
          urlSearchParams: {
            args: session.argv.args?.join(', '),
            ...(session.argv.options || {}),
          },
        })
      }
      if (!steamId) {
        const res = await ctx.database.get('cs_lookup', { userid: session.userId, platform: session.platform })
        if (res.length) {
          steamId = res[0].steamId
        } else {
          return "请提供 steamID 或者使用 `getid` 命令获取或者使用 `csBind <steamID>` 进行绑定"
        }
      }
      if (!config.useSteamAPI) {
        if (steamId.startsWith("https://steamcommunity.com/")) {
          const profUrl = `https://www.steamwebapi.com/steam/api/profile?key=${config.SteamWebAPIKey}&id=${steamId}`;
          const data = await ctx.http.get(profUrl);
          steamId = data.steamid;
        }
        const invUrl = `https://www.steamwebapi.com/steam/api/inventory?key=${config.SteamWebAPIKey}&steam_id=${steamId}&game=csgo`;
        const profUrl = `https://www.steamwebapi.com/steam/api/profile?key=${config.SteamWebAPIKey}&steam_id=${steamId}`;
        try {
          const invData = await ctx.http.get(invUrl);
          const profData = await ctx.http.get(profUrl);
          const itemMap = new Map<string, { count: number, imageUrl: string }>();

          let totalItemCount = 0;
          for (const item of invData) {
            totalItemCount++;
            const itemName = item.marketname;
            const imageUrl = item.image;
            if (!itemMap.has(itemName)) {
              itemMap.set(itemName, { count: 0, imageUrl: imageUrl });
            }
            let itemInfo = itemMap.get(itemName);
            itemInfo.count += 1;
          }

          let cardHtml = ``;
          const current = config.theme ? light : dark
          for (const [itemName, itemInfo] of itemMap.entries()) {
            cardHtml += `
            <div class="col-4 flex flex-col h-full w-full min-w-[250px] max-w-[350px]">
              <div class="bg-[${current[2]}] shadow-lg rounded-2xl p-4 flex flex-col justify-between h-full">
                <h2 class="text-lg font-semibold mb-2 flex-grow break-words text-[${current[1]}] mb-5">${itemName}</h2>
                <img src="${itemInfo.imageUrl}" alt="${itemName}" style="width:20%;">
              </div>
            </div>
          `;
          }

          const totalStr = `总物品数: ${totalItemCount}`;
          const html = generateHtml(cardHtml, totalStr, steamId, profData.personaname, config.theme);
          const image = await ctx.puppeteer.render(html);
          return image;
        } catch (e) {
          ctx.logger('cs-lookup').error(e)
          return "出现错误, 请检查该用户库存是否公开或者网络连接是否正常"
        }
      } else {
        if (!isOnlyDigits(steamId)) {
          return "无效steamID, 若不知道steamID请使用指令 `getid Steam个人资料页链接` 获取";
        }
        const invUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=schinese`
        try {
          const invData = await ctx.http.get(invUrl);
          const itemMap = new Map<string, { count: number, imageUrl: string }>();

          for (const item of invData.descriptions) {
            const itemName = item.market_name;
            const imageUrl = "https://community.cloudflare.steamstatic.com/economy/image/" + item.icon_url;
            if (!itemMap.has(itemName)) {
              itemMap.set(itemName, { count: 0, imageUrl: imageUrl });
            }
            let itemInfo = itemMap.get(itemName);
            itemInfo.count += 1; 
          }

          let cardHtml = ``;
          const current = config.theme ? light : dark
          for (const [itemName, itemInfo] of itemMap.entries()) {
            cardHtml += `
            <div class="col-4 flex flex-col h-full w-full min-w-[250px] max-w-[350px]">
              <div class="bg-[${current[2]}] shadow-lg rounded-2xl p-4 flex flex-col justify-between h-full">
                <h2 class="text-lg font-semibold mb-2 flex-grow break-words text-[${current[1]}] mb-5">${itemName}</h2>
                <img src="${itemInfo.imageUrl}" alt="${itemName}" style="width:20%;">
              </div>
            </div>
          `;
          }

          const totalStr = `总物品数: ${invData.total_inventory_count}`;
          const html = generateHtml(cardHtml, totalStr, steamId, '', config.theme);
          const image = await ctx.puppeteer.render(html);
          return image
        } catch (e) {
          ctx.logger('cs-lookup').error(e)
          return "出现错误, 请检查该用户库存是否公开或者与SteamAPI的连接是否正常"
        }
      }
    })
}

export function generateHtml(cardHTML, totalStr, steamId, steamName, theme: boolean): string {
  const current = theme ? light : dark
  return `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CS 库存查询</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-[${current[0]}] text-[${current[1]}]">
    <div class="max-w-7xl mx-auto p-4">
    
      <div class="text-center mb-5">
        <div class="bg-[${current[2]}] shadow-lg rounded-2xl py-4 px-6">
          <p class="text-2xl font-bold text-[${current[1]}]">CS 库存查询 - ${steamName}(${steamId})</p>
          <div class="text-sm">${totalStr}</div>
        </div>
      </div>
    
      <div class="grid grid-cols-4 gap-3">
        ${cardHTML}
      </div>
    </div>
  </body>
  `;
}