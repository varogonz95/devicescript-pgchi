import { TimeApiClient } from "../http/time-api/time-api";
import { ISyncedClock } from "../interfaces/clock";
import { DateParts, DayName, DayNamesMap } from "../interfaces/date";

export class SyncedClockService implements ISyncedClock {
    private year: number = 0
    private month: number = 0
    private day: number = 0
    private dayOfWeek: number = 0
    private hour: number = 0
    private minute: number = 0
    private seconds: number = 0

    constructor(
        private readonly timeApiClient: TimeApiClient
    ) {
    }

    public async sync(timezone: string): Promise<void> {
        const { year, month, day, dayOfWeek, hour, minute, seconds } = await this.timeApiClient.currentZone(timezone)
        console.log("Time API: ", year, month, day, dayOfWeek, hour, minute, seconds);
        this.year = year
        this.month = month
        this.day = day
        this.dayOfWeek = DayNamesMap[dayOfWeek as DayName]
        this.hour = hour
        this.minute = minute
        this.seconds = seconds
        console.log("New time: ", await this.now());
    }

    public async now(): Promise<DateParts> {
        return [this.year, this.month, this.day, this.dayOfWeek, this.hour, this.minute, this.seconds]
    }
}