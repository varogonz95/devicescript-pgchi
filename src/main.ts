import { SSD1306Driver, startCharacterScreen } from "@devicescript/drivers";
import { Observable, collect, interval, map } from "@devicescript/observables";
import { configureHardware, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { readSetting } from "@devicescript/settings";
import { pins, board } from "@dsboard/esp32_wroom_devkit_c";
import { SensorReading } from "./interfaces/sensor-reading";
import { fetch } from "@devicescript/net";
import { FirebaseHttpClient } from "./http/firebase-http-client";
import { encrypt, ivSize, randomBuffer } from "@devicescript/crypto";
import { ConfigKey } from "./enums";
import { AzureDbCosmosClient } from "./http/azure-db-cosmos/azure-db-cosmos";
import { RealTimeClock } from "@devicescript/core";
import { toDateString } from "./utils";

type SensorRecord<T extends Record<string, Observable<unknown>>> = Record<keyof T, SensorReading>

// this secret is stored in the .env.local and uploaded to the device settings
const adafruitUser = await readSetting(ConfigKey.AdaUsername)
const adafruitKey = await readSetting(ConfigKey.AdaKey)
const feed = "pgotchi-data"

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
const url = `https://io.adafruit.com/api/v2/${adafruitUser}/feeds/${feed}/data`
const headers = { "X-AIO-Key": adafruitKey, "Content-Type": "application/json" }

configureHardware({
    i2c: {
        pinSDA: pins.P21,
        pinSCL: pins.P22
    }
})

const SECONDS = 1000
const soilMin = await readSetting<number>(ConfigKey.SoilMin, 0)
const soilMax = await readSetting<number>(ConfigKey.SoilMax, 1)
const lightMin = await readSetting<number>(ConfigKey.LightMin, 0)
const lightMax = await readSetting<number>(ConfigKey.LightMax, 1)

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

const realTimeclock = new RealTimeClock()
const clockParts = await realTimeclock.reading.read()
const date = toDateString(clockParts)

const azureKey = await readSetting<string>(ConfigKey.AzureCosmosPrimaryKey)
const azureCosmosClient = new AzureDbCosmosClient()
const authSignature = azureCosmosClient.getMasterKeyAuthSignature({
    date,
    key: azureKey,
    keyType: "master",
    resourceType: "colls",
    resourceLink: "https://{databaseaccount}.documents.azure.com/dbs/{db-id}/colls",
    verb: "GET"
})

// const firebaseClient = new FirebaseHttpClient()
// await firebaseClient.register(/* encrypted */"")
// const signInResponse = await firebaseClient.signInWithPassword("varogonz95@gmail.com", "CorsairK63W")
// console.log(signInResponse)
// const response = await firebaseClient.createDocument("sensors", {})
// console.log(response)
const sensorObservablesRecord = { light: $light, soil: $soil, }
const sensorObservables = collect(
    sensorObservablesRecord,
    interval(10 * SECONDS),
    { clearValuesOnEmit: true }
)
    .pipe(map(observables => <SensorRecord<typeof sensorObservablesRecord>>observables))
    .subscribe(async observer => {
        const { light, soil } = observer

        // const { status } = await fetch(url, {
        //     method: "POST",
        //     headers,
        //     body: JSON.stringify({ value: soil.value }),
        // })

        // const response = await firebaseClient.createDocument("cities", {soil, light})

        // console.log(await response.text())
    })

// const ssdDisplay = new SSD1306Driver({ height: 64, width: 128 })

// try {
//     const characterScreen = await startCharacterScreen(ssdDisplay)
//     await characterScreen.message.write(
//         `
// `)
// } catch (error) {
//     console.warn(`${SSD1306Driver.constructor.name} is not available:`, error)
// }

