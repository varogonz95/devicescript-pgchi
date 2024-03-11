import { Observable } from "@devicescript/observables";
import { PeripheralsConfig } from "./config";
import { PeripheralAdapterFactory, PeripheralRecords } from "./peripherals";


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