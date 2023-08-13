import { DateFormat, DateParts, DayAbbrNamesIndexMap, DayAbbrNamesMap, MonthsIndex } from "./interfaces/date"

export type Map<K extends string | number | symbol, T> = {
    [key in K]: T
}

export const toDateBuffer = (dateParts: DateParts, timezone: string, format: DateFormat = DateFormat.RFC1123): Buffer => {
    const [year, month, date, weekday, hours, mins, secs] = dateParts
    switch (format) {
        case DateFormat.RFC1123:
            const dateDigits = `${date}`.length === 1 ? `0${date}` : date
            const hoursDigits = `${hours}`.length === 1 ? `0${hours}` : hours
            const minsDigits = `${mins}`.length === 1 ? `0${mins}` : mins
            const secsDigits = `${secs}`.length === 1 ? `0${secs}` : secs
            const dayOfWeek = DayAbbrNamesIndexMap[weekday]
            const dateBuffer = Buffer.from(`${dayOfWeek}, ${dateDigits} ${MonthsIndex[month]} ${year}`)
            const timeBuffer = Buffer.from(`${hoursDigits}:${minsDigits}:${secsDigits} GMT`)
            const wholeDateBuffer = Buffer.concat(dateBuffer, Buffer.from(' '), timeBuffer)
            return wholeDateBuffer

        default:
            return Buffer.from(`${year}/${month}/${date} ${hours}:${mins}:${secs}`)
    }
}