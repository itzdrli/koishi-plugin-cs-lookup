import { Context, Schema } from 'koishi';
import { inv } from './cs-inv';
import { apply as getId } from './getid';

export const name = 'cs-lookup';

export const inject = ['puppeteer']

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
<h2>如遇使用问题可以前往QQ群: 957500313 讨论<h2>
<h2> 本插件需要来自 <a href="www.steamwebapi.com">steamwebapi.com</a> 的 SteamWebAPI Key 进行非官方接口的背包查询和SteamID查询</h2>
<h2> 匿名数据收集 👉 <a href="https://legal.itzdrli.com">隐私政策</a> </h2>
<h3> 即为: </br>使用官方api查询背包: 不需要key(仅查询背包(中文)且容易被墙)</br>不使用官方api查询背包: 需要key(可以查背包(英文)和SteamID)</h3>
<p>请我喝杯咖啡 👇</br><a href="https://ko-fi.com/itzdrli"><img src="https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="ko-fi"></a></p> 
<a style="
    font-size: 30px;
    border: 2px solid red;
    display: inline-block;
    border-radius: 20px;
    padding: 5px;
    background: blue;
    color: #fff;
">爱发电</a>`;

export function apply(ctx: Context, config: Config) {
  inv(ctx, config);
  getId(ctx, config);
}