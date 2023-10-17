import * as ds from "@devicescript/core";
import { startLightLevel, startRelay, startSoilMoisture } from "@devicescript/servers";
import { IPeripheralConfig, PeripheralConfigTypes } from "./config";
import { LampRelayPin, LightLevelPin, SoilMoisturePin } from "./constants";
import { UnsupportedSensorServerError } from "./errors";
import { BaseRoutine, Routines } from "./routines";
import { Actions } from "./actions";
import { DriverStore } from "./driver-store";

export enum PeripheralType {
    LightLevel = 'lightLevel',
    SoilMoisture = 'soilMoisture',
    Relay = "relay"
}

export type AnalogInPeripherals = ds.LightLevel | ds.SoilMoisture
export type OutPeripherals = ds.Relay
export type DevicePeripheralTypes = AnalogInPeripherals | OutPeripherals;

export type HandlerArgs = [boolean, Partial<Actions>];

export abstract class PeripheralAdapter<T extends DevicePeripheralTypes, R = any> {
    public readonly type: PeripheralType
    public readonly invert: boolean = false
    public readonly autostart: boolean = false
    public readonly register: ds.Register<R>
    
    protected readonly sensor: T
    protected _latestRead: R
    protected _driverStore: DriverStore

    constructor(
        peripheral: PeripheralConfigTypes,
        protected readonly _routine?: BaseRoutine) {
        this.sensor = this.startServer()
        this.invert = peripheral.invert || false
        this.autostart = peripheral.autostart || false
        this.register = this.initRegister()
        this._driverStore = DriverStore.getInstance()
    }

    protected async __read() {
        this._latestRead = await this.register.read()
        console.log(this._latestRead);
        return this._latestRead
    }

    public async read() {
        return await this.__read()
    }

    public async write(value: R) {
        if (this._latestRead !== value)
            return await this.register.write(value)
    }

    public async handler(): Promise<ds.Handler<HandlerArgs>> {
        return async (args: HandlerArgs) => {
            const [meetsConditions, actions] = args
            if (actions.setValue) {
                const { target, value, otherwise, duration, durationUntil } = actions.setValue
                const newValue = meetsConditions ? value : otherwise
                const targetDriver = this._driverStore.get(target)
                await targetDriver.write(newValue)

                if (duration) {
                    await ds.delay(duration) // TODO: Improve implementation 
                    await targetDriver.write(otherwise)
                }
            }

            if (actions.sendEmail) {
                // TODO: Implement email notification
            }
        }
    }

    protected abstract startServer(): T
    protected abstract initRegister(): ds.Register<R>
}

export class LightLevelAdapter extends PeripheralAdapter<ds.LightLevel, number>  {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.LightLevel>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    public override async read(): Promise<number> {
        const value = await this.__read()
        const newMin = this.invert ? 1 : 0;
        const newMax = this.invert ? 0 : 1;
        return Math.map(value, 0, 1, newMin, newMax)
    }

    protected startServer(): ds.LightLevel {
        return startLightLevel({ pin: ds.gpio(LightLevelPin) })
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }
}

export class SoilMoistureAdapter extends PeripheralAdapter<ds.SoilMoisture, number>  {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.SoilMoisture>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    protected startServer(): ds.SoilMoisture {
        return startSoilMoisture({ pin: ds.gpio(SoilMoisturePin) })
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }
}

export class RelayAdapter extends PeripheralAdapter<ds.Relay, boolean> {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.Relay>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    protected startServer(): ds.Relay {
        return startRelay({ pin: ds.gpio(LampRelayPin) })
    }
    protected initRegister(): ds.Register<boolean> {
        return this.sensor.enabled
    }
}

export class PeripheralAdapterFactory {
    public static create(peripheral: PeripheralConfigTypes, routine?: Routines): PeripheralAdapter<DevicePeripheralTypes> {
        switch (peripheral.type) {
            case PeripheralType.LightLevel:
                return new LightLevelAdapter(peripheral, routine)

            case PeripheralType.SoilMoisture:
                return new SoilMoistureAdapter(peripheral, routine)

            case PeripheralType.Relay:
                return new RelayAdapter(peripheral, routine)

            default:
                const type = (peripheral as PeripheralConfigTypes).type
                throw new UnsupportedSensorServerError(type)
        }
    }
}