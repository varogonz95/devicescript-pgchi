import { readSetting } from "@devicescript/settings";
import { ConfigKeyMap } from "./enums";
import { Map } from "./utils";

export type ConfigObject = {
    [key in keyof typeof ConfigKeyMap]?: string;
};

export class Configuration {
    private static configObj: ConfigObject

    public static async hydrate(): Promise<ConfigObject> {
        let config: Map<string, string> = {}
        for (const key in ConfigKeyMap) {
            config[key] = await readSetting<string>(ConfigKeyMap[key])
        }
        this.configObj = config
        return this.configObj
    }

    public static get(key: keyof typeof ConfigKeyMap): string {
        if (this.configObj)
            return this.configObj[key]
        throw new Error('Configuration is not hydrated')
    }
}