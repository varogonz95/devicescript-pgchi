import { RoutineCondition } from "./routines"

export interface PushNotificationAction {
    title: string
    message: string
}

export interface SetValueAction {
    target: string
    value: number | boolean
    otherwise?: number | boolean,
    duration?: number
    durationUntil?: RoutineCondition
}

export interface SendEmailAction {
    recipients: string
    title: string
    body: string
}

export interface WebhookAction {
    url: string
    data?: string
}

export interface Actions {
    pushNotification: PushNotificationAction,
    sendEmail: SendEmailAction,
    setValue: SetValueAction,
    webhook: WebhookAction,
}