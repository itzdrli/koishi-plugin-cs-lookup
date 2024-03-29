import { Context } from 'koishi';
import { Config } from '../index';

export function apply(ctx: Context, config: Config) {
  ctx.command('getid <profLink>', '获取Steam ID', { authority: 0 })
    .action(async ({ session }, profLink) => {
      if (!profLink.startsWith("https://steamcommunity.com/")) {
        return '请输入正确的Steam个人资料链接';
      }
      const profUrl = `https://www.steamwebapi.com/steam/api/profile?key=${config.SteamWebAPIKey}&id=${profLink}`;
      const data = await ctx.http.get(profUrl);
      let result = '用户名: ' + 
        data.personaname + 
        '\n玩家名: ' + 
        data.realname + 
        '\nSteam ID: ' + 
        data.steamids.steamid64;
      return result;
    });
}