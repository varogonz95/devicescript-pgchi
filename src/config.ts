import { PeripheralType } from "./peripherals"
import { RoutineTypes } from "./routines"

export interface PeripheralConfig {
    name: string
    type: PeripheralType
    display?: boolean
    displayRow?: number
    reverse?: boolean
}

export type PeripheralsConfig = Record<string, PeripheralConfig>
export type RoutinesConfig = Record<string, RoutineTypes>

export interface DeviceConfig {
    description?: string
    peripherals: PeripheralsConfig
    routines?: RoutinesConfig
}