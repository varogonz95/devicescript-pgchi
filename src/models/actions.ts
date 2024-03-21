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


export type SetValue = { setValue: SetValueAction }

export type Actions =
    | { pushNotification: PushNotificationAction }
    | { sendEmail: SendEmailAction }
    | SetValue
    | { webhook: WebhookAction }
