import { Actions, SetValue } from "./models/actions";
import { RoutinesConfig } from "./models/config";
import { PeripheralRecords } from "./models/peripherals";
import { ConditionType, RoutineCondition, isAllOfCondition, isAnyOfCondition, isRangeConditionType, isScalarConditionType } from "./models/routines";

export class RoutineOrchestrator {

    public static async runAll(peripherals: PeripheralRecords, routines: RoutinesConfig) {
        for (const key in routines) {
            const { conditions, actions } = routines[key]
            const reading = await peripherals[key].read()
            const meetsConditions = this.conditionsMet(conditions, reading)

            if (this.isSetValueAction(actions)) {
                const { target, value, otherwise, durationOptions } = actions.setValue
                const peripheral = peripherals[target]
                const newValue = meetsConditions ? value : otherwise
                await peripheral.write(newValue, durationOptions)
            }

            // if (actions.sendEmail) {
            //     // TODO: Implement email notification
            // }
        }
    }

    private static conditionsMet<T>(conditions: RoutineCondition, value: T) {
        if (isAllOfCondition(conditions)) {
            return this.allOfConditionsMet(conditions.allOf, value);
        }

        if (isAnyOfCondition(conditions)) {
            return this.anyOfConditionsMet(conditions.anyOf, value);
        }

        return false;
    }

    private static evaluateConditions(conditions: ConditionType[], value: any) {
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

    private static allOfConditionsMet(conditions: ConditionType[], value: any) {
        return this
            .evaluateConditions(conditions, value)
            .every(assertion => assertion === true)
    }

    private static anyOfConditionsMet(conditions: ConditionType[], value: any) {
        return this
            .evaluateConditions(conditions, value)
            .some(assertion => assertion === true)
    }

    private static isSetValueAction(actions: Actions): actions is SetValue {
        return (actions as SetValue).setValue !== undefined
    }
}
