import { Actions } from "./actions"

export type ComparisonTypes =
    | "greaterThan"
    | "greaterOrEqualsTo"
    | "lessThan"
    | "lessOrEqualsTo"
    | "equals"
    | "notEquals"
    | "between"

// export type ConditionValue = number | [number, number]

export interface RoutineCondition {
    // sensor value
    subject: string // | WeatherService
    // boolean expressions,
    comparison: ComparisonTypes
    value: number | [number, number]
}

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

export interface ScheduledRoutine {
    schedule: Schedule
    condition: RoutineCondition
    actions: Partial<Actions>
}

export interface ConditionalRoutine {
    condition: RoutineCondition
    actions: Partial<Actions>
}