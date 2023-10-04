import { AnalogInPin, AnalogOutPin, IOPin, InputPin, OutputPin } from "@devicescript/core"

export type SensorIdentifier = "lightLevel" | "soilMoisture"
export type PeripheralIdentifier = "relay_lamp" | "relay_pump"
export type HardwareIdentifier = SensorIdentifier | PeripheralIdentifier
export type AnalogIOPin = AnalogInPin & AnalogOutPin
export type GPIOPin = IOPin & AnalogIOPin

export interface SensorDefinition {
    label?: string
    pinNumber: number
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

export interface RoutineCondition {
    // sensor value
    subject: "$this" | HardwareIdentifier // | WeatherService
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

export enum ActionDiscriminator {
    PUSH_NOTIFICATION = "pushNotification",
    SET_VALUE = "setValue",
    SEND_EMAIL = "sendEmail",
    WEBHOOK = "webhook",
}

export interface IHasDiscriminator<T> {
    discriminator: T
}

export interface IPlainObjectConvertable {
    toPlainObject(): object
}

export interface PushNotificationActionOptions {
    title: string
    message: string
}

export class PushNotificationAction implements IHasDiscriminator<ActionDiscriminator> {
    public readonly discriminator = ActionDiscriminator.PUSH_NOTIFICATION

    constructor(public pushNotification: PushNotificationActionOptions) {

    }
}

export interface SetValueActionOptions {
    target: "$this" | HardwareIdentifier
    value: number | boolean
    duration?: number
    durationUntil?: RoutineCondition
}

export class SetValueAction implements IHasDiscriminator<ActionDiscriminator> {
    public readonly discriminator = ActionDiscriminator.SET_VALUE

    constructor(public setValue: SetValueActionOptions) {

    }
}

export interface SendEmailActionOptions {
    recipients: string
    title: string
    body: string
}

export class SendEmailAction implements IHasDiscriminator<ActionDiscriminator> {
    public readonly discriminator = ActionDiscriminator.SEND_EMAIL

    constructor(public sendEmail: SendEmailActionOptions) {

    }
}

export interface WebhookActionOptions {
    url: string
    data?: string
}

export class WebhookAction implements IHasDiscriminator<ActionDiscriminator> {
    public readonly discriminator = ActionDiscriminator.WEBHOOK

    constructor(public webhook: WebhookActionOptions) {

    }
}

export type Actions = PushNotificationAction | SetValueAction | SendEmailAction | WebhookAction

export interface ScheduledRoutine {
    schedule: Schedule
    condition: RoutineCondition
    actions: Actions
}

export interface ConditionalRoutine {
    condition: RoutineCondition
    actions: Actions
}

export type RoutineTypes = ScheduledRoutine | ConditionalRoutine
export type SensorConfig = Record<HardwareIdentifier | string, SensorDefinition>
export type RoutineConfig = Record<HardwareIdentifier | string, RoutineTypes>

export interface DeviceConfig {
    sensors: SensorConfig,
    routines?: RoutineConfig
}