import { AnalogInPin, AnalogOutPin, IOPin, InputPin, OutputPin } from "@devicescript/core"

export type SensorIdentifiers = "lightLevel" | "soilMoisture"
export type PeripheralIdentifiers = "relay_lamp" | "relay_pump"
export type HardwareIdentifiers = SensorIdentifiers | PeripheralIdentifiers
export type AnalogIOPin = AnalogInPin & AnalogOutPin
export type GPIOPin = IOPin & AnalogIOPin

export interface SensorDefinition {
    label?: string
    pin: IOPin | AnalogIOPin
    startingValue?: number | boolean   // available if mode = output
    // mode: PinModes
}

export type ComparisonTypes =
    | "greaterThan"
    | "greaterOrEqualsTo"
    | "lessThan"
    | "lessOrEqualsTo"
    | "equals"
    | "notEquals"
    | "between"

export interface IHasCondition {
    condition: RoutineCondition
}

export interface RoutineCondition {
    // sensor value
    subject: "$this" | HardwareIdentifiers // | WeatherService
    // boolean expressions,
    comparison: ComparisonTypes
    value: number | string | [number, number]
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

export interface PushNotificationActionOptions {
    title: string
    message: string
}

export interface PushNotificationAction {
    pushNotification: PushNotificationActionOptions
}

export interface SetValueActionOptions {
    target: "$this" | HardwareIdentifiers
    value: number | boolean
    duration?: number
    durationUntil?: string
}

export interface SetValueAction {
    setValue: SetValueActionOptions
}

export interface SendEmailActionOptions {
    recipients: string
    title: string
    body: string
}

export interface SendEmailAction {
    sendEmail: SendEmailActionOptions
}

export interface WebhookActionOptions {
    url: string
    data?: string
}

export interface WebhookAction {
    webhook: WebhookActionOptions
}

export type Actions = PushNotificationAction | SetValueAction | SendEmailAction | WebhookAction

export interface ScheduledRoutine extends IHasCondition {
    schedule: Schedule
    actions: Actions
}

export interface ConditionalRoutine extends IHasCondition {
    actions: Actions
}

export type Routines = ScheduledRoutine | ConditionalRoutine

export interface DeviceConfig {
    sensors: Record<HardwareIdentifiers | string, SensorDefinition>,
    routines?: Record<HardwareIdentifiers | string, Routines>
}