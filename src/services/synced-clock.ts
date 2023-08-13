import { RealTimeClock, assert } from "@devicescript/core";
import { TimeApiClient } from "../http/time-api/time-api";
import { ISyncedClock } from "../interfaces/clock";
import { DateParts, DayName, DayNamesMap } from "../interfaces/date";

export class SyncedClockService implements ISyncedClock {
    constructor(
        private readonly rtc: RealTimeClock,
        private readonly timeApiClient: TimeApiClient
    ) { }

    public async sync(timezone: string): Promise<void> {
        const { year, month, day, dayOfWeek, hour, minute, seconds } = await this.timeApiClient.currentZone(timezone)
        console.log("Time API: ", year, month, day, dayOfWeek, hour, minute, seconds);
        await this.rtc.setTime(year, month, day, DayNamesMap[dayOfWeek as DayName], hour, minute, seconds)
    }

    public async now(): Promise<DateParts> {
        return await this.rtc.reading.read()
    }
}