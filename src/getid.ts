import { Context } from 'koishi';
import { Config } from './index';
import { } from 'koishi-plugin-umami-statistics-service'
import { umami } from './index';

export function apply(ctx: Context, config: Config) {
  const umamiD = umami
  ctx.command('getid <profLink:string>', '获取Steam ID', { authority: 0 })
    .action(async ({ session }, profLink) => {
      if (config.data_collect) {
        ctx.umamiStatisticsService.send({
          dataHostUrl: umami[1],
          website: umami[0],
          url: '/getid',
          urlSearchParams: {
            args: session.argv.args?.join(', '),
            ...(session.argv.options || {}),
          },
        })
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