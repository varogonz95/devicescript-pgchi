import { Actions } from "./actions"

export enum ComparisonType {
    GreaterThan = "greaterThan",
    GreaterOrEqualsTo = "greaterOrEqualsTo",
    LessThan = "lessThan",
    LessOrEqualsTo = "lessOrEqualsTo",
    Equals = "equals",
    NotEquals = "notEquals",
    Between = "between",
}

type NumberValueCondition = {
    [k in Exclude<ComparisonType, ComparisonType.Between>]: number
}

type RangeCondition = {
    [ComparisonType.Between]: [number, number]
}

export type ConditionType = NumberValueCondition | RangeCondition
export type AllOfConditions = { allOf: ConditionType[] }
export type AnyOfConditions = { anyOf: ConditionType[] }

export type RoutineCondition = AllOfConditions | AnyOfConditions

export type ScheduleFrequency =
    | "yearly"   // Valid when endAt - startAt <= 1 year
    | "monthly"  // Valid when endAt - startAt <= 1 month
    | "daily"    // Valid when endAt - startAt <= 1 day


export interface ScheduleRepeatOptions {
    frequency: ScheduleFrequency
    until?: RoutineCondition
}

export interface Schedule {
    startAt: string // dateString
    endAt?: string // dateString
    // Only when endAt is not null
    repeats?: ScheduleRepeatOptions
}

export interface Routine {
    condition: RoutineCondition
    actions: Partial<Actions>
}

export interface ScheduledRoutine extends Routine {
    schedule: Schedule
}