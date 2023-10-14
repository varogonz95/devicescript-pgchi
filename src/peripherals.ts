import * as ds from "@devicescript/core";
import { BaseServiceConfig, LightLevelConfig, SoilMoistureConfig, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { UnsupportedSensorServerError } from "./errors";

export enum PeripheralType {
    LightLevel = 'lightLevel',
    SoilMoisture = 'soilMoisture',
}

export type ReadablePeripherals = ds.LightLevel | ds.SoilMoisture
export type ActivablePeripherals = ds.Relay
export type DevicePeripheralTypes = ReadablePeripherals | ActivablePeripherals;

export interface IReadblePeripheral {
    readonly reading: ds.Register<number>
}

export interface IActivablePeripheral {
    readonly enabled: ds.Register<boolean>
}

export abstract class PeripheralAdapter<T extends DevicePeripheralTypes> {

    constructor(
        protected readonly type: PeripheralType,
        protected readonly config: BaseServiceConfig) {
    }

    public abstract start(): T
}

export class LightLevelSensorAdapter extends PeripheralAdapter<ds.LightLevel>  {
    constructor(config: LightLevelConfig) {
        super(PeripheralType.LightLevel, config)
    }

    public start(): ds.LightLevel {
        return startLightLevel(this.config as LightLevelConfig)
    }
}

export class SoilMoistureSensorAdapter extends PeripheralAdapter<ds.SoilMoisture>  {

    constructor(config: SoilMoistureConfig) {
        super(PeripheralType.SoilMoisture, config)
    }

    public start(): ds.SoilMoisture {
        return startSoilMoisture(this.config as SoilMoistureConfig)
    }
}

export class PeripheralAdapterFactory {
    public static create(type: PeripheralType, config: BaseServiceConfig): PeripheralAdapter<DevicePeripheralTypes> {
        switch (type) {
            case PeripheralType.LightLevel:
                return new LightLevelSensorAdapter(config as LightLevelConfig)

            case PeripheralType.SoilMoisture:
                return new SoilMoistureSensorAdapter(config as SoilMoistureConfig)

            default:
                throw new UnsupportedSensorServerError(type)
        }
    }
}