import { BaseServiceConfig, LightLevelConfig, SoilMoistureConfig } from "@devicescript/servers"
import { Routine, ScheduledRoutine } from "./routines"
import { PeripheralType } from "./types"

export interface IPeripheralConfig<T extends PeripheralType, C extends BaseServiceConfig> {
    type: T
    config: C
}

export type PeripheralConfigTypes =
    | IPeripheralConfig<PeripheralType.LightLevel, LightLevelConfig>
    | IPeripheralConfig<PeripheralType.SoilMoisture, SoilMoistureConfig>

export type Routines = ScheduledRoutine | Routine
export type PeripheralsConfig = Record<string, PeripheralConfigTypes>
export type RoutinesConfig = Record<string, Routines>

export interface DeviceConfig {
    peripherals: PeripheralsConfig
    routines?: RoutinesConfig
}