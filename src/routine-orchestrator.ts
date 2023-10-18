import { RoutinesConfig } from "./config";
import { DevicePeripheralTypes, PeripheralAdapter, PeripheralRecords } from "./peripherals";
import { ConditionType, RoutineCondition, RoutineTypes, isAllOfCondition, isAnyOfCondition, isRangeConditionType, isScalarConditionType } from "./routines";

export class RoutineOrchestrator {
    constructor() { }

    public async runAll(peripherals: PeripheralRecords, routines: RoutinesConfig) {
        for (const key in routines) {
            const { conditions, actions } = routines[key]
            const reading = await peripherals[key].read()
            const meetsConditions = this.conditionsMet(conditions, reading)

            if (actions.setValue) {
                const { target, value, otherwise, duration, durationUntil } = actions.setValue
                const peripheralTarget = peripherals[target]
                const newValue = meetsConditions ? value : otherwise
                await peripheralTarget.write(newValue)

                // if (duration) {
                //     await ds.delay(duration) // TODO: Improve implementation 
                //     await targetDriver.write(otherwise)
                // }
            }

            if (actions.sendEmail) {
                // TODO: Implement email notification
            }
        }
    }

    private conditionsMet<T>(conditions: RoutineCondition, value: T) {
        if (isAllOfCondition(conditions)) {
            return this.allOfConditionsMet(conditions.allOf, value);
        }

        if (isAnyOfCondition(conditions)) {
            return this.anyOfConditionsMet(conditions.anyOf, value);
        }

        return false;
    }

    private evaluateConditions(conditions: ConditionType[], value: any) {
        return conditions.map(condition => {
            if (isScalarConditionType(condition)) {
                return (condition.equals && value === condition.equals)
                    || (condition.greaterOrEqualsTo && value >= condition.greaterOrEqualsTo)
                    || (condition.greaterThan && value > condition.greaterThan)
                    || (condition.lessOrEqualsTo && value <= condition.lessOrEqualsTo)
                    || (condition.lessThan && value < condition.lessThan)
                    || (condition.notEquals && value !== condition.notEquals)

            }

            if (isRangeConditionType(condition)) {
                const [lower, upper] = condition.between
                return lower <= value && value <= upper
            }

            return false
        })
    }

    private allOfConditionsMet(conditions: ConditionType[], value: any) {
        return this.evaluateConditions(conditions, value)
            .every(assertion => assertion === true)
    }

    private anyOfConditionsMet(conditions: ConditionType[], value: any) {
        return this.evaluateConditions(conditions, value)
            .some(assertion => assertion === true)
    }
}