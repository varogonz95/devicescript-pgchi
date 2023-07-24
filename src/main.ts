import { Socket } from "@devicescript/net";
import { map, throttleTime } from "@devicescript/observables";
import { startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { readSetting } from "@devicescript/settings";
import { pins } from "@dsboard/esp32_wroom_devkit_c";

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

const soilMoistureSub = soilMoisture.reading
    .pipe(
        throttleTime(3 * SECONDS),
        map((value) => ({
            min: soilMin,
            max: soilMax,
            current: value,
            percent: Math.map(value, soilMin, soilMax, 0, 100)
        }))
    )
    .subscribe(async data => {
        console.data({ light: { ...data } })
    })

const lightLevelSub = lightLevel.reading
    .pipe(
        throttleTime(3 * SECONDS),
        map((value) => ({
            min: lightMin,
            max: lightMax,
            current: value,
            percent: Math.map(value, lightMin, lightMax, 0, 100)
        }))
    )
    .subscribe(async data => {
        console.data({ soil: { ...data } })
    })

/* const ssd = new SSD1306Driver({
    width: 128,
    height: 64,
    devAddr: 0x3d
})

const screen = await startCharacterScreen(ssd)
await screen.message.write(
`°( )° 
( O ) 
°( )° 
  |   
  |/  
  |   
~~~~~ `) */