import { assert } from "@devicescript/core";
import { DevicePeripheralTypes, PeripheralAdapter } from "./peripherals";

type Drivers = Record<string, PeripheralAdapter<DevicePeripheralTypes>>;

export class DriverStore {
    private static _instance: DriverStore = null
    private static _drivers: Drivers

    private constructor() { }

    public get(key: string) {
        return DriverStore._drivers[key]
    }

    static createInstance(drivers: Drivers): DriverStore {
        if (this._instance === null) {
            this._instance = new DriverStore()
            this._drivers = drivers
        }
        return this._instance
    }

    static getInstance(): DriverStore {
        assert(this._instance !== null, "Cannot get instance of DriverStore. Must call [createInstance] first")
        return this._instance
    }
}