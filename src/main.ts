import { CharacterScreen, format, gpio } from "@devicescript/core";
import { IndexScreenClient, SSD1306Driver, startCharacterScreen } from "@devicescript/drivers";
import { Observable, OperatorFunction, collectTime, map, tap } from "@devicescript/observables";
import { configureHardware, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_wroom_devkit_c";
import { Configuration } from "./configuration";

configureHardware({
    i2c: {
        pinSDA: pins.P21,
        pinSCL: pins.P22
    }
})

const {
    SoilPin,
    SoilMin,
    SoilMax,

    LightPin,
    LightMin,
    LightMax,

    Timezone,
    AzureUri
} = await Configuration.hydrate()

interface SensorReading {
    value: number,
    percent: number
}

const soilMoisture = startSoilMoisture({
    name: "Soil Moisture",
    pin: pins.P32
})

const lightLevel = startLightLevel({
    name: "Light Level",
    pin: pins.P33
})

export const read = (min: number, max: number): OperatorFunction<number, SensorReading> =>
    map((value: number) => ({ 
        value, 
        percent: Math.map(value, min || 0, max || 1, 0, 100) 
    }));

const $soil = soilMoisture.reading
    .pipe(read(parseFloat(SoilMin), parseFloat(SoilMax)))

const $light = lightLevel.reading
    .pipe(read(parseFloat(LightMin), parseFloat(LightMax)))

type SensorRecord = Record<string, SensorReading>
type ObservableSensorRecord = Record<string, Observable<SensorReading>>

const sensorsObservables: ObservableSensorRecord = {
    light: $light,
    soil: $soil
}

const ssdDisplay = new SSD1306Driver({ width: 128, height: 64, devAddr: 0x3c })
// const indexedScreen = await startIndexedScreen(ssdDisplay, { columns: 16, rows: 8 })
const characterScreen = await startCharacterScreen(ssdDisplay, { columns: 16, rows: 8 })

collectTime(sensorsObservables, 1000)
    .pipe(tap(data => console.data(data)))
    .subscribe(async (sensors) => {
        const { light, soil } = sensors as Partial<SensorRecord>
        const content = displaySensorData({ light, soil })
        // await indexedScreenPrint(indexedScreen, content);
        await characterScreenPrint(characterScreen, content);
    })

const displaySensorData = (sensorReading: SensorRecord): Buffer =>
    Buffer.from(
        `Plant
------------------------------------

Water: ${format("{01}", sensorReading['soil'].percent)}%
Light: ${format("{01}", sensorReading['light'].percent)}%`)


const indexedScreenPrint = async (screen: IndexScreenClient, content: Buffer) => {
    screen.image.print(content.toString(), 0, 0);
    await screen.show();
}

const characterScreenPrint = async (screen: CharacterScreen, content: Buffer) =>
    await screen.message.write(content.toString());

type BoolOperator = ">" | "<" | "=" | ">=" | "<=" | "not";

interface SensorData {
    id: string | number,
    label: string,
    provider: string,
    enableWhen?: [string, BoolOperator, string | number | boolean]
}

interface DeviceConfig {
    sensors: SensorData[],
}

const processPipeline = (cfg: DeviceConfig) => {
    const sensorObservables: ObservableSensorRecord = {}

    for (const sensor of cfg.sensors) {
        switch (sensor.provider) {
            case "LightLevel":
                const $light = startLightLevel({ pin: gpio(parseInt(LightPin)) })
                sensorObservables[sensor.id] = $light.reading.pipe(read(0, 1))
                break;
                case "SoilMoisture":
                    const $soil = startSoilMoisture({ pin: gpio(parseInt(SoilPin)) })
                    sensorObservables[sensor.id] = $light.reading.pipe(read(0, 1))
                    break;
        
            default:
                throw new Error("Sensor not supported")
        }
        if (sensor.provider === "LightLevel") {
        }
    }

    return collectTime(sensorObservables, 1000)
        .subscribe(sensors => {
            const { enableWhen } = cfg.sensors[1]

            if (enableWhen) {
                const otherSensorParts = enableWhen[0].split('|').map(p => p.trim())
                const pipes = otherSensorParts.slice(1)

                let value: number
                for (const pipe of pipes) {
                    if (pipe === "percent") {
                        value = percentPipe(cfg.sensors[0], sensors[""])
                    }
                }

                if (enableWhen[1] === ">=") {
                    sensor.enable = value >= enableWhen[2]
                }


            }
        })
}