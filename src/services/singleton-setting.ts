import { readSetting } from "@devicescript/settings";

export class Settings {
    private static records: Record<string, any>

    public static async readSetting(key: string, defaultValue?: any): Promise<any> {
        this.records = this.records || {};
        if (!this.records[key]) {
            this.records[key] = await readSetting(key, defaultValue);
        }
        return this.records[key];
    }

    // public async writeSetting(key: string, defaultValue?: any): Promise<any> {
    //     if (!this.records[key]) {
    //         this.records[key] = await readSetting(key, defaultValue)
    //     }
    //     return this.records[key]
    // }
}