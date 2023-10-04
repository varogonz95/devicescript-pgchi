import { Register } from "@devicescript/core"
import { Observable, OperatorFunction, filter, threshold } from "@devicescript/observables"
import { ConditionalRoutine, HardwareIdentifier, RoutineTypes, ScheduledRoutine } from "./config"

export interface IReadable {
    reading: Register<number>
}

export function routine<T>(sensorId: HardwareIdentifier, routine: RoutineTypes): OperatorFunction<T, T> {
    return (source: Observable<T>) => {
        const { actions, condition } = routine
        const routineSchedule = routine as ScheduledRoutine
        const conditionalRoutine = routine as ConditionalRoutine

        if (routineSchedule.schedule) {
            //...
        }

        const {subject, comparison, value} = condition
        if (comparison === "between") {
            if (typeof value === "object") {
                source.pipe(filter(data => value[0] < data < value[1]))
            }
        }
    }
}