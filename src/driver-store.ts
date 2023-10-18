import { assert } from "@devicescript/core";
import { DevicePeripheralTypes, PeripheralAdapter } from "./peripherals";

export class DriverStore {
    private static _instance: DriverStore
    private static _peripherals: PeripheralAdapter<DevicePeripheralTypes>[]

    constructor() { }

    public get(key: string) {
        return DriverStore._peripherals.find(p => p.id = key)
    }

    static createInstance(peripherals: PeripheralAdapter<DevicePeripheralTypes>[]): DriverStore {
        if (this._instance === null) {
            DriverStore._instance = new DriverStore()
            this._peripherals = peripherals
        }
        return DriverStore._instance
    }

    static getInstance(): DriverStore {
        assert(!DriverStore._instance, "Cannot get instance of DriverStore. Must call [createInstance] first")
        console.log(DriverStore._instance);
        
        return DriverStore._instance
    }
}