import * as ds from "@devicescript/core";
import { Observable } from "@devicescript/observables";
import { DurationOptions } from "./actions";
import { PeripheralConfig } from "./config";
import { ScreenColumns } from "../constants";

export enum PeripheralType {
    LightLevel = 'lightLevel',
    SoilMoisture = 'soilMoisture',
    Relay = "relay"
}

export type AnalogInPeripherals = ds.LightLevel | ds.SoilMoisture
export type OutPeripherals = ds.Relay
export type DevicePeripheralTypes = AnalogInPeripherals | OutPeripherals;
export type DevicePeripheral = PeripheralAdapter<DevicePeripheralTypes>;
export type PeripheralRecords = Record<string, DevicePeripheral>

export abstract class PeripheralAdapter<T extends DevicePeripheralTypes, R = any> {
    public readonly name: string
    public readonly reverse: boolean
    public readonly autostart: boolean
    public readonly display: boolean
    public readonly displaySlot: number
    public readonly register: ds.Register<R>

    protected readonly sensor: T

    private lastRead: R

    constructor(
        public id: string,
        peripheral: PeripheralConfig
    ) {
        this.sensor = this.startServer()
        this.register = this.initRegister()
        this.name = peripheral.name || peripheral.type
        this.reverse = peripheral.reverse || false
        this.display = peripheral.display || false
        this.displaySlot = peripheral.displayRow || 0
    }

    protected async __read() {
        this.lastRead = await this.register.read()
        return this.lastRead
    }

    public async read() {
        return await this.__read()
    }

    // public readonly writeDurationHandler =
    //     (peripheral: DevicePeripheral, value: R) => async () => await peripheral.write(value);

    public async write(value: R, options?: DurationOptions<R>) {
        if (this.lastRead !== value) {
            await this.register.write(value)
        }
        // if (options) {
        //     setTimeout(this.writeDurationHandler(this, options.fallbackValue), options.duration)
        // }
    }

    public async toDisplay() {
        const value = await this.read()
        return `${this.name}: ${value}`
    }

    public reading<R>(): Observable<R> {
        return this.register.pipe()
    }

    public binding(): ds.ClientRegister<boolean> {
        return this.sensor.binding();
    }

    protected abstract startServer(): T
    protected abstract initRegister(): ds.Register<R>
}

export class LightLevelAdapter extends PeripheralAdapter<ds.LightLevel, number>  {
    constructor(
        key: string,
        peripheral: PeripheralConfig) {
        super(key, peripheral)
    }

    public override async read(): Promise<number> {
        const value = await this.__read()
        const newMin = this.reverse ? 1 : 0;
        const newMax = this.reverse ? 0 : 1;
        return Math.map(value, 0, 1, newMin, newMax)
    }

    protected startServer(): ds.LightLevel {
        return new ds.LightLevel(this.name)
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }

    public override async toDisplay() {
        const value = await this.read()
        const additionalChars = [':', ' ', '[', ']'].length
        const width = ScreenColumns - this.name.length - additionalChars
        return `${this.name}: [${this.charProgressBar(value, width)}]`
    }

    private charProgressBar(value: number, charWidth: number) {
        const charsLen = Math.map(value, 0, 1, 0, charWidth) - 1
        let bar = ''
        for (let i = 0; i < charsLen; i++) {
            bar += "="
        }
        return bar
    }
}

export class SoilMoistureAdapter extends PeripheralAdapter<ds.SoilMoisture, number>  {
    constructor(
        key: string,
        peripheral: PeripheralConfig) {
        super(key, peripheral)
    }

    protected startServer(): ds.SoilMoisture {
        return new ds.SoilMoisture(this.name)
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }

    public override async toDisplay() {
        const value = await this.read()
        const additionalChars = [':', ' ', ' ', '[', ']'].length
        const width = ScreenColumns - this.name.length - additionalChars
        return `${this.name}:  [${this.charProgressBar(value, width)}]`
    }

    private charProgressBar(value: number, charWidth: number) {
        const charsLen = Math.map(value, 0, 1, 0, charWidth) - 1
        let bar = ''
        for (let i = 0; i < charsLen; i++) {
            bar += "="
        }
        return bar
    }
}

export class RelayAdapter extends PeripheralAdapter<ds.Relay, boolean> {
    constructor(
        key: string,
        peripheral: PeripheralConfig) {
        super(key, peripheral)
    }

    public override async toDisplay(): Promise<string> {
        const enabled = await this.read()
        return `${this.name}: ${enabled ? "On" : 'Off'}`
    }

    protected startServer(): ds.Relay {
        return new ds.Relay(this.name)
    }

    protected initRegister(): ds.Register<boolean> {
        return this.sensor.enabled
    }
}

export class PeripheralAdapterFactory {
    public static create(key: string, peripheral: PeripheralConfig): DevicePeripheral {
        switch (peripheral.type) {
            case PeripheralType.LightLevel:
                return new LightLevelAdapter(key, peripheral)

            case PeripheralType.SoilMoisture:
                return new SoilMoistureAdapter(key, peripheral)

            case PeripheralType.Relay:
                return new RelayAdapter(key, peripheral)

            default:
                const type = (peripheral as PeripheralConfig).type
                throw new Error(type)
        }
    }
}