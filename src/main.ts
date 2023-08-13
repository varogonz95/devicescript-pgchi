import { Observable, collect, interval, map } from "@devicescript/observables";
import { configureHardware, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { readSetting } from "@devicescript/settings";
import { pins } from "@dsboard/esp32_wroom_devkit_c";
import { ConfigKeyMap } from "./enums";
import { AzureDbCosmosClient } from "./http/azure-db-cosmos/azure-db-cosmos";
import { SensorReading } from "./interfaces/sensor-reading";
import { SyncedClockService } from "./services/synced-clock";
import { Configuration } from "./configuration";
import { TimeApiClient } from "./http/time-api/time-api";
import { RealTimeClock } from "@devicescript/core";

type SensorRecord<T extends Record<string, Observable<unknown>>> = Record<keyof T, SensorReading>

// this secret is stored in the .env.local and uploaded to the device settings
// const adafruitUser = await readSetting(ConfigKeyMap.AdaUsername)
// const adafruitKey = await readSetting(ConfigKeyMap.AdaKey)
// const feed = "pgotchi-data"

// // this is currently the only algorithm supported
// const algo = "aes-256-ccm"
// // get key from settings
// const key = Buffer.from(await readSetting<string>("APP_KEY"), "utf8")
// console.log("key:", key);

// // you should never ever reuse IV; always generate them randomly!
// const iv = randomBuffer(ivSize(algo))
// // encrypt data
// const encrypted = encrypt({
//     algo,
//     key,
//     iv,
//     data: Buffer.from("MzVDDB8odSIZ8Vrz"),
//     tagLength: 0,
// })

// console.log("random string: ", iv)
// console.log("encrypted: ", encrypted)

// Adafruit IO API https://io.adafruit.com/api/docs/#create-data
// const url = `https://io.adafruit.com/api/v2/${adafruitUser}/feeds/${feed}/data`
// const headers = { "X-AIO-Key": adafruitKey, "Content-Type": "application/json" }

configureHardware({
    i2c: {
        pinSDA: pins.P21,
        pinSCL: pins.P22
    }
})

const SECONDS = 1000
const {SoilMin, SoilMax, LightMin, LightMax, Timezone, AzureUri} = await Configuration.hydrate()

const soilMoisture = startSoilMoisture({
    name: "Soil Moisture",
    pin: pins.P32
})

const lightLevel = startLightLevel({
    name: "Light Level",
    pin: pins.P33
})

// const $soil = soilMoisture.reading
//     .pipe(
//         map((value) => <SensorReading>{
//             value,
//             percent: Math.map(value, SoilMin, soilMax, 0, 100)
//         })
//     )

// const $light = lightLevel.reading
//     .pipe(
//         map((value) => <SensorReading>{
//             value,
//             percent: Math.map(value, lightMin, lightMax, 0, 100)
//         })
//     )

const rtc = new RealTimeClock()
console.log("Date before request: ", await rtc.reading.read());

const timeApiClient = new TimeApiClient()
const clockService = new SyncedClockService(rtc, timeApiClient)
await clockService.sync(Timezone)

const azureCosmosClient = new AzureDbCosmosClient(AzureUri, clockService)
const response = await azureCosmosClient.getCollections("pgotchi")
console.log(await response.text())

// const sensorObservablesRecord = { light: $light, soil: $soil, }
// const sensorObservables = collect(
//     sensorObservablesRecord,
//     interval(10 * SECONDS),
//     { clearValuesOnEmit: true }
// )
//     .pipe(map(observables => <SensorRecord<typeof sensorObservablesRecord>>observables))
//     .subscribe(async observer => {
//         // Do something...
//     })

// const ssdDisplay = new SSD1306Driver({ height: 64, width: 128 })

// try {
//     const characterScreen = await startCharacterScreen(ssdDisplay)
//     await characterScreen.message.write(
//         `
// `)
// } catch (error) {
//     console.warn(`${SSD1306Driver.constructor.name} is not available:`, error)
// }

