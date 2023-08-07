import { SSD1306Driver, startCharacterScreen } from "@devicescript/drivers";
import { Observable, collect, interval, map } from "@devicescript/observables";
import { configureHardware, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { readSetting } from "@devicescript/settings";
import { pins, board } from "@dsboard/esp32_wroom_devkit_c";

interface SensorReading {
    value: number,
    percent: number,
}

type SensorRecord<T extends Record<string, Observable<unknown>>> = Record<keyof T, SensorReading>

configureHardware({
    i2c: {
        pinSDA: pins.P21,
        pinSCL: pins.P22
    }
})

const SECONDS = 1000
const soilMin = await readSetting<number>("soilMin", 0)
const soilMax = await readSetting<number>("soilMax", 1)
const lightMin = await readSetting<number>("lightMin", 0)
const lightMax = await readSetting<number>("lightMax", 1)

const soilMoisture = startSoilMoisture({
    name: "Soil Moisture",
    pin: pins.P32
})

const lightLevel = startLightLevel({
    name: "Light Level",
    pin: pins.P33
})

const $soil = soilMoisture.reading
    .pipe(
        map((value) => <SensorReading>{
            value,
            percent: Math.map(value, soilMin, soilMax, 0, 100)
        })
    )

const $light = lightLevel.reading
    .pipe(
        map((value) => <SensorReading>{
            value,
            percent: Math.map(value, lightMin, lightMax, 0, 100)
        })
    )

const sensorObservablesRecord = { light: $light, soil: $soil, }

const sensorObservables = collect(
    sensorObservablesRecord,
    interval(3 * SECONDS),
    { clearValuesOnEmit: true }
)
.pipe(map(observables => <SensorRecord<typeof sensorObservablesRecord>>observables))

const ssdDisplay = new SSD1306Driver({ height: 64, width: 128 })

try {
    const characterScreen = await startCharacterScreen(ssdDisplay)
    await characterScreen.message.write(
`
`)
} catch (error) {
    console.warn(`${SSD1306Driver.constructor.name} is not available:`, error)
}

