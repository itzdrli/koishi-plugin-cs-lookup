import { Context } from 'koishi';
import { Config } from '../index';
import Umami from '../umami';

export function apply(ctx: Context, config: Config) {
  ctx.command('getid <profLink:string>', '获取Steam ID', { authority: 0 })
    .action(async ({ session }, profLink) => {
      if (config.data_collect) {
        Umami.send({
          ctx,
          url: '/getid',
          urlSearchParams: {
            args: session.argv.args?.join(', '),
            ...(session.argv.options || {}),
          }
        });
      }
      if (!profLink.startsWith("https://steamcommunity.com/")) {
        return '请输入正确的Steam个人资料链接';
      }
      const profUrl = `https://www.steamwebapi.com/steam/api/profile?key=${config.SteamWebAPIKey}&id=${profLink}`;
      const data = await ctx.http.get(profUrl);
      let result = '用户名: ' +
        data.personaname +
        '\nSteam ID: ' +
        data.steamid;
      return result;
    });
}