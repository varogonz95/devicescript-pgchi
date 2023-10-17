import { Handler, delay } from "@devicescript/core";
import { interval, map } from "@devicescript/observables";
import { DeviceConfig } from "./config";
import { Seconds } from "./constants";
import { DevicePeripheralTypes, PeripheralAdapter, PeripheralAdapterFactory, PeripheralType } from "./peripherals";
import { ConditionType, RoutineCondition, isAllOfCondition, isAnyOfCondition, isRangeConditionType, isScalarConditionType, isScheduledRoutine } from "./routines";
import { Actions } from "./actions";
import { DriverStore } from "./driver-store";

const deviceConfig: DeviceConfig = {
    peripherals: {
        foo: { type: PeripheralType.LightLevel, invert: true },
        bar: { type: PeripheralType.SoilMoisture },
        baz: { type: PeripheralType.Relay },
    },
    routines: {
        foo: {
            conditions: {
                allOf: [
                    { between: [0, 0.15] },
                ]
            },
            actions: {
                setValue: {
                    target: "baz",
                    value: true,
                    otherwise: false
                }
            }
        }
    }
}


const { peripherals, routines } = deviceConfig

type PeripheralAdapters = Record<string, PeripheralAdapter<DevicePeripheralTypes>>
let adapters: PeripheralAdapters = {}

// Initialize sensor servers respectively
for (const pKey in peripherals) {
    const config = peripherals[pKey]
    adapters[pKey] = PeripheralAdapterFactory.create(config, routines[pKey])
}

DriverStore.createInstance(adapters)

function conditionsMet(conditions: RoutineCondition, value: any) {
    if (isAllOfCondition(conditions)) {
        return allOfConditionsMet(conditions.allOf, value);
    }

    if (isAnyOfCondition(conditions)) {
        return anyOfConditionsMet(conditions.anyOf, value);
    }

    return false;
}

function evaluateConditions(conditions: ConditionType[], value: any) {
    const assertions: boolean[] = []

    for (const condition of conditions) {
        if (isScalarConditionType(condition)) {
            if (condition.equals) {
                assertions.push(value === condition.equals)
            }
            else if (condition.greaterOrEqualsTo) {
                assertions.push(value >= condition.greaterOrEqualsTo)
            }
            else if (condition.greaterThan) {
                assertions.push(value > condition.greaterThan)
            }
            else if (condition.lessOrEqualsTo) {
                assertions.push(value <= condition.lessOrEqualsTo)
            }
            else if (condition.lessThan) {
                assertions.push(value < condition.lessThan)
            }
            else if (condition.notEquals) {
                assertions.push(value !== condition.notEquals)
            }
            else { }
        }

        if (isRangeConditionType(condition)) {
            if (condition.between) {
                const [lower, upper] = condition.between
                assertions.push(lower <= value && value <= upper)
            }
            else { }
        }
    }
    return assertions
}

function allOfConditionsMet(conditions: ConditionType[], value: any) {
    const assertions = evaluateConditions(conditions, value)
    return assertions.every(assertion => assertion === true)
}

function anyOfConditionsMet(conditions: ConditionType[], value: any) {
    const assertions = evaluateConditions(conditions, value)
    return assertions.some(assertion => assertion === true)
}

interval(1 * Seconds)
    .pipe(map(async _ => {
        const thing: Record<string, [number, [boolean, Partial<Actions>], Handler<[boolean, Partial<Actions>]>]> = {}

        for (const key in routines) {
            const adapter = adapters[key]
            const value = await adapter.read()
            const { actions, conditions } = routines[key]
            const meetsConditions = conditionsMet(conditions, value)

            if (isScheduledRoutine(routines[key])) {
                // TODO: Handle schedule
            }
            thing[key] = [value, [meetsConditions, actions], adapter.handler]
        }

        return thing
    }))
    .subscribe(async commands => {
        for (const key in commands) {
            const [_, args, execute] = commands[key]
            await execute(args)
        }
    })