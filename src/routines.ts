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

export type ScalarCondition = {
    [k in Exclude<ComparisonType, ComparisonType.Between>]: number
}

export type RangeCondition = {
    [k in ComparisonType.Between]: [number, number]
}

export type ConditionType = ScalarCondition | RangeCondition
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

export interface BaseRoutine {
    conditions: RoutineCondition
    actions: Actions
}

export interface ScheduledRoutine extends BaseRoutine {
    schedule: Schedule
}

export type RoutineTypes = BaseRoutine | ScheduledRoutine

export function isBaseRoutine(routine: RoutineTypes): routine is BaseRoutine {
    return Object.keys(routine).every(key => ['actions', 'condition'].includes(key))
}

export function isScheduledRoutine(routine: RoutineTypes): routine is ScheduledRoutine {
    return (routine as ScheduledRoutine).schedule !== undefined
}

export function isAllOfCondition(condition: RoutineCondition): condition is AllOfConditions {
    return (condition as AllOfConditions).allOf !== undefined
}

export function isAnyOfCondition(condition: RoutineCondition): condition is AnyOfConditions {
    return (condition as AnyOfConditions).anyOf !== undefined
}

export function isScalarConditionType(conditionType: any): conditionType is ScalarCondition {
    return conditionType.between === undefined
}

export function isRangeConditionType(conditionType: any): conditionType is RangeCondition {
    return (conditionType as RangeCondition).between !== undefined
}