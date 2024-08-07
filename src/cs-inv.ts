import { Context } from 'koishi'
import { Config } from './index'
import fs from 'node:fs'
import path from 'node:path'
import { } from 'koishi-plugin-puppeteer'
import Umami from './umami'

export function isOnlyDigits(str: string): boolean {
  return /^\d+$/.test(str);
}

export function generateHtml(chotaStyles, cardHTML, totalStr, steamId, steamName, theme: boolean): string {
  const light = ['#e9f1fc', '#c0cfe3']
  const dark = ['#11141c', '#1a202c', '#2d374c', '#2d404c']
  return `
  <html>

  <head>
    <style>
      ${chotaStyles}
  
      body {
        ${theme ? `--font-color: #000000;` : `--font-color: #f5f5f5;`}
        ${theme ? `background: linear-gradient(to right, ${light[0]}, ${light[1]});` : `background: linear-gradient(to right, ${dark[0]}, ${dark[1]});`}
      }
  
      .card {
        ${theme ? `` : `background: linear-gradient(to right, ${dark[2]}, ${dark[3]})`};
        box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 2%);
        border-radius: 15px;
      }
  
      .card h2 {
        ${theme ? `--font-color: #000000;` : `--font-color: #f5f5f5;`}
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
        margin-bottom: 0.25rem;
        font-size: 1.52rem;
      }
  
      .card p {
        ${theme ? `--font-color: #000000;` : `--font-color: #f5f5f5;`}
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
        font-size: 2.25rem;
      }
  
      .card .tag {
        ${theme ? `--font-color: #000000;` : `--font-color: #f5f5f5;`}
        font-size: 1.3rem;
      }
    </style>
  </head>
  
  <body>
    <div class="col-12">
      <div class="card">
        <p>CS库存查询 - ${steamName}(${steamId})</p>
        <div class="tag">${totalStr}</div>
        <div class="tag">Generated by koishi-plugin-cs-lookup v0.4.1</div>
        <div class="tag">本项目开源于 GitHub@itzdrli/koishi-plugin-cs-lookup</div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        ${cardHTML}
      </div>
    </div>
  </body>
  
  </html>
  `;
}

export function inv(ctx: Context, config: Config) {
  const chotaStyles = fs.readFileSync(path.join(path.parse(__filename).dir,'./chota.min.css'), 'utf-8');
  ctx.command('cs-inv <steamId>', '查看CS背包', { authority: 0 })
    .action(async ({ session }, steamId) => {
      if (config.data_collect) {
        Umami.send({
          ctx,
          url: '/cs-inv',
          urlSearchParams: {
            args: session.argv.args?.join(', '),
            ...(session.argv.options || {}),
          }
        });
      }
      if (!isOnlyDigits(steamId)) {
        return "无效steamID, 若不知道steamID请使用指令 `getid Steam个人资料页链接` 获取";
      }
      if (!config.useSteamAPI) {
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
            const imageUrl = item.image; // 获取图片URL
            // 检查 itemMap 是否已经有这个 itemName，如果没有，则初始化
            if (!itemMap.has(itemName)) {
              itemMap.set(itemName, { count: 0, imageUrl: imageUrl });
            }
            let itemInfo = itemMap.get(itemName);
            itemInfo.count += 1; // 增加物品计数
            // itemMap.set(itemName, itemInfo); // 这一步实际上是多余的，因为对象是引用类型
          }

          let cardHtml = ``;
          for (const [itemName, itemInfo] of itemMap.entries()) {
            cardHtml += `
            <div class="col-4">
              <div class="card">
                <h2>${itemName}</h2>
                <img src="${itemInfo.imageUrl}" alt="${itemName}" style="width:13%;">
              </div>
            </div>
          `;
          }

          const totalStr = `总物品数: ${totalItemCount}`;
          const html = generateHtml(chotaStyles, cardHtml, totalStr, steamId, profData.personaname, config.theme);
          const image = await ctx.puppeteer.render(html);
          return image;
        } catch (e) {
          ctx.logger('cs-lookup').error(e)
          return "出现错误, 请检查该用户库存是否公开或者网络连接是否正常"
        }
      } else {
        const invUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=schinese`
        try {
          const invData = await ctx.http.get(invUrl);
          const itemMap = new Map<string, { count: number, imageUrl: string }>();

          for (const item of invData.descriptions) {
            const itemName = item.market_name;
            const imageUrl = "https://community.cloudflare.steamstatic.com/economy/image/" + item.icon_url; // 获取图片URL
            // 检查 itemMap 是否已经有这个 itemName，如果没有，则初始化
            if (!itemMap.has(itemName)) {
              itemMap.set(itemName, { count: 0, imageUrl: imageUrl });
            }
            let itemInfo = itemMap.get(itemName);
            itemInfo.count += 1; // 增加物品计数
            // itemMap.set(itemName, itemInfo); // 这一步实际上是多余的，因为对象是引用类型
          }

          let cardHtml = ``;
          for (const [itemName, itemInfo] of itemMap.entries()) {
            cardHtml += `
            <div class="col-4">
              <div class="card">
                <h2>${itemName}  <img src="${itemInfo.imageUrl}" alt="${itemName}" style="width:13%;"></h2>
              </div>
            </div>
          `;
          }

          const totalStr = `总物品数: ${invData.total_inventory_count}`;
          const html = generateHtml(chotaStyles, cardHtml, totalStr, steamId, '', config.theme);
          const image = await ctx.puppeteer.render(html);
          return image
        } catch (e) {
          ctx.logger('cs-lookup').error(e)
          return "出现错误, 请检查该用户库存是否公开或者与SteamAPI的连接是否正常"
        }
      }
    })
}