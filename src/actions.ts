export interface PushNotificationAction {
    title: string
    message: string
}

export interface DurationOptions<R> {
    duration: number,
    fallbackValue: R
}

export interface SetValueAction {
    target: string
    value: number | boolean
    otherwise?: number | boolean,
    durationOptions?: DurationOptions<number | boolean>
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

export enum ActionType {
    PushNotification = "pushNotification",
    SendEmail = "sendEmail",
    SetValue = "setValue",
    Webhook = "webhook",
}

export type SetValueActionType = { type: "setValue" | ActionType.SetValue } & SetValueAction

export type Action = SetValueActionType // | ...