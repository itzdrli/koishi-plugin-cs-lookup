# cs-lookup

[![Github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/itzdrli/koishi-plugin-cs-lookup) [![npm](https://img.shields.io/npm/v/koishi-plugin-cs-lookup?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-cs-lookup) [![Build Status](https://app.travis-ci.com/itzdrli/koishi-plugin-cs-lookup.svg?branch=master)](https://app.travis-ci.com/itzdrli/koishi-plugin-cs-lookup)
请我喝杯咖啡 -->[![ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/itzdrli)

如何使用：

### 安装配置
打开Koishi插件市场, 搜索 cs-lookup 下载安装；

#### 使用 非官方API 进行背包查询
> 稳定, 但是需要自行注册API Key, 并且可以使用 `getid` 指令
安装后前往配置页面关闭选项 `useSteamAPI` , 然后打开网站 [steamwebapi.com](https://www.steamwebapi.com/) , 
点击右上角的使用 Steam 登录, 登陆完成后将获得一个 API Key, 将其复制并填入插件配置页的 `SteamWebAPIKey` 选项, 保存并启用插件即可.

#### 使用 官方API 进行背包查询
> 容易被墙, 但是不需要API Key, 同时不能使用 `getid` 指令
安装后启用选项 `useSteamAPI` 即可(默认启用)

### 使用
指令:
- `cs-inv <steamID>`
- `getid <Steam个人资料链接>`