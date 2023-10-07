import { RoutineCondition } from "./routines"

export interface PushNotificationAction {
    title: string
    message: string
}

export interface SetValueAction {
    target: string
    value: number | boolean
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

export enum ActionTypes {
    PushNotification = "pushNotification",
    SetValue = "setValue",
    SendEmail = "sendEmail",
    Webhook = "webhook",
}

export interface Actions {
    [ActionTypes.PushNotification]: PushNotificationAction,
    [ActionTypes.SendEmail]: SendEmailAction,
    [ActionTypes.SetValue]: SetValueAction,
    [ActionTypes.Webhook]: WebhookAction,
}