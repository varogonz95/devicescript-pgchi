import { PeripheralType } from "./peripherals"
import { Routines } from "./routines"

export interface IPeripheralConfig<T extends PeripheralType> {
    type: T
    invert?: boolean
    autostart?: boolean
}

export type PeripheralConfigTypes =
    | IPeripheralConfig<PeripheralType.LightLevel>
    | IPeripheralConfig<PeripheralType.SoilMoisture>
    | IPeripheralConfig<PeripheralType.Relay>

export type PeripheralsConfig = Record<string, PeripheralConfigTypes>
export type RoutinesConfig = Record<string, Routines>

export interface DeviceConfig {
    peripherals: PeripheralsConfig
    routines?: RoutinesConfig
}