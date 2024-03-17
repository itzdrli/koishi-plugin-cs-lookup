import { Context, Schema } from 'koishi';
import { inv } from './commands/cs-inv';
import { apply as getId } from './commands/getid';

export const name = 'cs-lookup';

export const inject = {
  optional: ['puppeteer']
}
export interface Config {
  SteamWebAPIKey: string,
  useImg: boolean
}

export const Config: Schema<Config> = Schema.object({
  SteamWebAPIKey: Schema.string().description("Steam Web API Key from www.steamwebapi.com"),
  useImg: Schema.boolean().default(false).description("是否为背包查询(cs-inv)使用图片回复(需要puppeteer)")
})

export const usage = `
<h2> This plugin requires a SteamWebAPI Key from <a href="https://www.steamwebapi.com">steamwebapi.com</a></h2>
<h2> 本插件需要来自 <a href="www.steamwebapi.com">steamwebapi.com</a> 的SteamWebAPI Key</h2>
<p>请我喝杯咖啡 👉<a href="https://ko-fi.com/itzdrli"><img src="https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="ko-fi"></a></p>
`;

export function apply(ctx: Context, config: Config) {
  inv(ctx, config);
  getId(ctx, config);
}