import { delay } from "@devicescript/core";
import { MQTTClient } from "@devicescript/net";
import { Observable } from "@devicescript/observables";
import { PeripheralsConfig } from "./models/config";
import { seconds } from "./constants";
import { PeripheralAdapterFactory, PeripheralRecords } from "./models/peripherals";


export function initializeAdapters(peripherals: PeripheralsConfig): PeripheralRecords {
    let adapters: PeripheralRecords = {}
    for (const key in peripherals) {
        const config = peripherals[key]
        const peripheral = PeripheralAdapterFactory.create(key, config);
        adapters[key] = peripheral
    }
    return adapters
}

export function toReadingRecords(adapters: PeripheralRecords): Record<string, Observable<unknown>> {
    let records: Record<string, Observable<unknown>> = {};
    const keys = Object.keys(adapters);
    for (let i = 0; i < keys.length; i++) {
        records[keys[i]] = adapters[keys[i]].reading();
    }
    return records;
}

export async function publishSensorData<T>(client: MQTTClient, topic: string, sensors: Record<string, T>) {
    const message = JSON.stringify({ ...sensors });
    const success = await client.publish(topic, message);
    console.debug("Message published: ", success);
}

export async function waitTillDevicesAreBound(peripherals: PeripheralRecords) {
    while (true) {
        console.log("Waiting for sensors...");

        const promises = Object.keys(peripherals)
            .map(async (key) => await peripherals[key].binding().read());

        let boundDevices = [];
        for (let i = 0; i < promises.length; i++) {
            boundDevices.push(await promises[i]);
        }

        if (boundDevices.every(isBound => isBound)) {
            console.log("All sensors bound!");
            break;
        }

        await delay(seconds(1));
    }
}