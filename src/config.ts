import { BaseServiceConfig, LightLevelConfig, SoilMoistureConfig } from "@devicescript/servers"
import { ConditionalRoutine, ScheduledRoutine } from "./routines"
import { SensorType } from "./types"

export interface ISensorConfig<T extends SensorType, C extends BaseServiceConfig> {
    type: T
    config: C
}

export type SensorConfigTypes =
    | ISensorConfig<SensorType.LightLevel, LightLevelConfig>
    | ISensorConfig<SensorType.SoilMoisture, SoilMoistureConfig>

export type SensorsConfig = Record<string, SensorConfigTypes>
export type RoutineTypes = ScheduledRoutine | ConditionalRoutine
export type RoutinesConfig = Record<string, RoutineTypes>

export interface DeviceConfig {
    sensors: SensorsConfig
    routines?: RoutinesConfig
}