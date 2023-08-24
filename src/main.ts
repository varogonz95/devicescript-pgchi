import { SSD1306Driver, startCharacterScreen, startIndexedScreen } from "@devicescript/drivers";
import { Observable, collect, collectTime, map, tap } from "@devicescript/observables";
import { configureHardware, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_wroom_devkit_c";
import { Configuration } from "./configuration";
import { format } from "@devicescript/core";

interface SensorReading {
    value: number,
    percent: number
}

configureHardware({
    i2c: {
        pinSDA: pins.P21,
        pinSCL: pins.P22
    }
})

const { SoilMin, SoilMax, LightMin, LightMax, Timezone, AzureUri } = await Configuration.hydrate()

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
            percent: Math.map(value, parseInt(SoilMin) || 0, parseInt(SoilMax) || 1, 0, 100)
        })
    )

const $light = lightLevel.reading
    .pipe(
        map((value) => <SensorReading>{
            value,
            percent: Math.map(value, parseInt(LightMin) || 0, parseInt(LightMax) || 1, 0, 100)
        })
    )

// const timeApiClient = new TimeApiClient()
// const syncedClockService = new SyncedClockService(timeApiClient)
// await syncedClockService.sync(Timezone)

// const azureCosmosClient = new AzureDbCosmosClient(AzureUri, syncedClockService)
// const response = await azureCosmosClient.getDatabase("pgotchi-db")
// console.log(await response.text())

type SensorRecord = Record<string, SensorReading>
type SensorObservableRecord = Record<string, Observable<SensorReading>>

const sensorsObservables: SensorObservableRecord = {
    light: $light,
    soil: $soil
}

const ssdDisplay = new SSD1306Driver({width: 128, height: 64, devAddr: 0x3c })
const characterScreen = await startIndexedScreen(ssdDisplay, {columns: 16, rows: 8})

collectTime(sensorsObservables, 1000)
    .pipe(tap(data => console.data(data)))
    .subscribe(async (sensors) => {
        const { light, soil } = sensors as Partial<SensorRecord>
        await characterScreen.image.print(displaySensorData({ light, soil }), 0, 0)
        await characterScreen.show()
    })

const displaySensorData = (sensorReading: SensorRecord): string =>
`Plant
------------------------------------

Water: ${format("{01}", sensorReading['soil'].percent) }%
Light: ${format("{01}", sensorReading['light'].percent)}%`


