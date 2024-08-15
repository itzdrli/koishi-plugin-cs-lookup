import { Context, Schema } from 'koishi';
import { inv } from './cs-inv';
import { apply as getId } from './getid';
import { bind } from './csbind';

export const name = 'cs-lookup';

export const inject = ['puppeteer', 'database']

export interface Config {
  data_collect: boolean,
  theme: boolean,
  useSteamAPI: boolean,
  SteamWebAPIKey: string
}

export const Config: Schema<Config> = Schema.object({
  data_collect: Schema.boolean().default(true).description('是否允许匿名数据收集 隐私政策见上方链接'),
  theme: Schema.boolean().default(false).description('使用浅色主题'),
  useSteamAPI: Schema.boolean().default(true).description("是否使用Steam官方API查询 (大陆地区实例可能存在网络不佳情况)"),
  SteamWebAPIKey: Schema.string().description("Steam Web API Key from www.steamwebapi.com"),
})

export const usage = `
## 如遇使用问题可以前往QQ群: 957500313 讨论
## 本插件需要来自 [steamwebapi.com](https://www.steamwebapi.com) 的 SteamWebAPI Key 进行非官方接口的背包查询和SteamID查询  
## 匿名数据收集 👉 [隐私协议](https://legal.itzdrli.com)  

### 使用官方api查询背包: 不需要key(仅查询背包(中文)且容易被墙)</br>不使用官方api查询背包: 需要key(可以查背包(英文)和SteamID)</h3>
请我喝杯咖啡 👇   
[![ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/itzdrli)
### [爱发电](https://afdian.com/a/itzdrli)`;

declare module 'koishi' {
  interface Tables {
    cs_lookup: CsLookup
  }
}

export interface CsLookup {
  id: string
  steamId: string
  userid: string
  platform: string
}

export function apply(ctx: Context, config: Config) {
  ctx.model.extend('cs_lookup', {
    id: 'string',
    steamId: 'string',
    userid: 'string',
    platform: 'string'
  }, {})
  inv(ctx, config);
  getId(ctx, config);
  bind(ctx);
}