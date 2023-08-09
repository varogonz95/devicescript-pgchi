import { Sensor } from "@devicescript/core";
import { IConfiguration } from "./interfaces/configuration";

export class App {
    public async start(builder: AppBuilder, options: any) {
        await builder.configure()
        await builder.registerClients(...options.clients)
    }
}

export class AppBuilder {
    constructor(
        private readonly configuration: IConfiguration,) {

    }

    async configure(): Promise<void> {
        const setting = await this.configuration.get("", 123)
    }

    async registerClients(...clients: Sensor[]): Promise<void> {
        clients.forEach(sensor => {
        })
    }
}