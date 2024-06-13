import os from "node:os";
import {Context, version} from "koishi";
import packageJson from "../package.json"

const dataHostUrl: string = 'https://data.itzdrli.com';
const website: string = "29272bd1-0f4c-4db8-ad22-bec20ee15810";

interface Payload {
  website: string;
  hostname?: string;
  language?: string;
  referrer?: string;
  screen?: string;
  title?: string;
  url?: string;
  name?: string;
  data?: Record<string, any>;
}

const Umami = {
  send({ctx, url = '/', urlSearchParams, title, eventName, data}: {
    ctx: Context,
    url?: string,
    urlSearchParams?: Record<string, any>
    title?: string,
    eventName?: string
    data?: Record<string, any>,
  }) {
    const searchParams = new URLSearchParams();
    if (searchParams) {
      for (let key in urlSearchParams) {
        searchParams.set(key, urlSearchParams[key]);
      }
    }
    searchParams.set('koishi_version', version);
    searchParams.set('plugin_name', packageJson.name);
    searchParams.set('plugin_version', packageJson.version);
    ctx.http.post(
      dataHostUrl + '/api/send',
      JSON.stringify({
        type: "event",
        payload: {
          website,
          hostname: os.hostname(),
          screen: "3440x1440",
          language: ctx.root.config.i18n?.locales?.[0],
          url: url.replace(/\?[\s\S]*/, '') + '?' + searchParams.toString(),
          title,
          name: eventName,
          data,
        } as Payload
      }),
      {
        headers: {
          'content-type': 'application/json',
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/11.4.5.14`,
        },
      }
    );
  },
}


export default Umami;