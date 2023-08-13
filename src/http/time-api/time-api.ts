import { fetch } from "@devicescript/net"
import { HttpMethod, defaultHeaders } from "../http"

export interface CurrentTimeZoneResponse {
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    seconds: number,
    milliSeconds: number,
    dateTime: string,
    date: string,
    time: string,
    timeZone: string,
    dayOfWeek: string,
    dstActive: false
}

export class TimeApiClient {
    private readonly timeUri = "https://www.timeapi.io/api/Time"

    constructor() {
    }

    public async currentZone(ianaTimeZone: string): Promise<CurrentTimeZoneResponse> {
        const url = `${this.timeUri}/current/zone?timeZone=${ianaTimeZone}`
        const {text} = await fetch(url, {
            headers: defaultHeaders(),
            method: HttpMethod.Get
        })
        const rawResponse = await text()
        const jsonPart = rawResponse.split("\n")[1]
        return JSON.parse(jsonPart)
    }
}