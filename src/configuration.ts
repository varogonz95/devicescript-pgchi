import { IConfiguration } from "./interfaces/configuration";

export class ConfigurationBuilder {
    public static async build<T = any>(): Promise<Configuration<T>> {
        throw new Error("Method not implemented.");
    }

    public static async buildFromFile<T = any>(file: string): Promise<Configuration<T>> {
        throw new Error("Method not implemented.");
    }
}

export class Configuration<T> implements IConfiguration {
    private configObj: T

    async get<T = any>(section: string, defaultValue?: T): Promise<T> {
        throw new Error("Method not implemented.");
    }

    async set<T = any>(section: string, value: T): Promise<void> {
        throw new Error("Method not implemented.");
    }

}