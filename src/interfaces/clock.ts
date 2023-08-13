import { DateParts } from "./date"

export interface StartOptions {
    syncAtStart: boolean,
    syncTimeZone: string
}

export interface IClock {
    now(): Promise<DateParts>
}

export interface ISyncedClock extends IClock{
    sync(timezone: string): Promise<void>
}