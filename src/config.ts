import { PeripheralType } from "./peripherals"
import { RoutineTypes } from "./routines"

export interface PeripheralConfig{
    name: string
    type: PeripheralType
    display?: boolean
    displayRow?: number
    reverse?: boolean
    autostart?: boolean
}

export type PeripheralsConfig = Record<string, PeripheralConfig>
export type RoutinesConfig = Record<string, RoutineTypes>

export interface DeviceConfig {
    name: string
    description?: string
    peripherals: PeripheralsConfig
    routines?: RoutinesConfig
}