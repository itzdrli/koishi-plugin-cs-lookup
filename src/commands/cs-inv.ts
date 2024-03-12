import { Context } from 'koishi';
import { Config } from '../index';
import { } from 'koishi-plugin-puppeteer'

export function isOnlyDigits(str: string): boolean {
  return /^\d+$/.test(str);
}

export function generateHtml(result: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=auto, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          background-color: #1a202c;
          color: #fff;
        }
      </style>
    </head>
    <body style="width: 650px">
      <div class="container mx-auto py-8">
        <div class="bg-gray-800 p-4 rounded-lg text-center"><pre><code class="text-white">${result}</code></pre></div>
      </div>
      <footer class="bg-gray-800 text-center py-2">
        <p class="text-white" style="font-size: 10px">Powered by ItzTech</p>
      </footer>
    </body>
    </html>
  `;
}

export function inv(ctx: Context, config: Config) {
  ctx.command('cs-inv <steamId>', '查看CS背包', { authority: 0 })
    .action(async ({ session }, steamId) => {
      if (!isOnlyDigits(steamId)) {
        return "无效steamID, 若不知道steamID请使用指令 `getid Steam个人资料页链接` 获取";
      }
      const invUrl = `https://www.steamwebapi.com/steam/api/inventory?key=${config.SteamWebAPIKey}&steam_id=${steamId}&game=csgo`;
      const profUrl = `https://www.steamwebapi.com/steam/api/profile?key=${config.SteamWebAPIKey}&steam_id=${steamId}`;
      try {
        const invData = await ctx.http.get(invUrl);
        const profData = await ctx.http.get(profUrl);
        let result = `玩家 ${profData.realname}(${steamId}) 的库存: \n`;
        const itemMap = new Map<string, number>();
        let totalItemCount = 0;
        for (const item of invData) {
          totalItemCount++;
          const itemName = item.marketname;
          const itemCount = item.count;
          itemMap.set(itemName, (itemMap.get(itemName) || 0) + itemCount);
        }

        for (const [itemName, itemCount] of itemMap.entries()) {
          result += `${itemName} 数量: ${itemCount}\n`;
        }

        result += `总物品数: ${totalItemCount}`;
        if (!config.useImg) return result;
        else {
          result = result.replace(/\n/g, '<br>');
          const html = generateHtml(result);
          const image = await ctx.puppeteer.render(html);
          return image;
        }
      } catch (error) {
        return error;
      }
    });
}