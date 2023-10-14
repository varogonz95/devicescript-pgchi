import { Routines } from "./config"
import { ISensor } from "./peripherals"

export interface SensorRoutineCommand {
    data: ISensor,
    execute(routine: Routines): void
}

export type SensorCommandRecord = Record<string, SensorRoutineCommand>