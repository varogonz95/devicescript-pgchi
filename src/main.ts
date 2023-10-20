import { deviceIdentifier } from "@devicescript/core";
import { SSD1306Driver, SSD1306Options, startCharacterScreenDisplay } from "@devicescript/drivers";
import { DeviceConfig, PeripheralsConfig } from "./config";
import { ScreenColumns, ScreenHeight, ScreenRows, ScreenWidth, Seconds, ServiceUrl } from "./constants";
import { PeripheralAdapterFactory, PeripheralRecords, PeripheralType } from "./peripherals";
import { runAll } from "./routine-orchestrator";
import { fetch } from "@devicescript/net";

const deviceId = deviceIdentifier("self");
const ssd1306Options: SSD1306Options = {
    width: ScreenWidth,
    height: ScreenHeight,
    devAddr: 0x3c
}
const ssd1306 = await startCharacterScreenDisplay(
    new SSD1306Driver(ssd1306Options),
    {
        columns: ScreenColumns,
        rows: ScreenRows,
    }
)


const deviceConfig: DeviceConfig = {
    name: "node-1",
    peripherals: {
        light: { name: "Light", type: PeripheralType.LightLevel, display: true, invert: true },
        soil: { name: "Soil", type: PeripheralType.SoilMoisture, display: true, },
        lamp: { name: "Lamp", type: PeripheralType.Relay, display: true },
        pump: { name: "Pump", type: PeripheralType.Relay, display: true },
    },
    routines: {
        light: {
            conditions: {
                allOf: [
                    { between: [0, 0.25] },
                ]
            },
            actions: {
                setValue: {
                    target: "lamp",
                    value: true,
                    otherwise: false
                }
            }
        },
        soil: {
            conditions: {
                allOf: [
                    { between: [0, 0.1] },
                ]
            },
            actions: {
                setValue: {
                    target: "pump",
                    value: true,
                    otherwise: false
                }
            }
        },
    }
}
// const response = await fetch(ServiceUrl, {
//     headers: {},
//     method: "GET"
// })
// const deviceConfig = (await response.json()) as DeviceConfig2
const { name: deviceName, peripherals, routines } = deviceConfig
const adapters = initializeAdapters(peripherals)

function initializeAdapters(peripherals: PeripheralsConfig) {
    let adapters: PeripheralRecords = {}
    for (const key in peripherals) {
        const config = peripherals[key]
        const peripheral = PeripheralAdapterFactory.create(key, config);
        adapters[key] = peripheral
    }
    return adapters
}

setInterval(async () => {
    const sensorData = Object.keys(adapters)
        .map(key => adapters[key])
        .filter(adapter => adapter.display)
        // .sort((a, b) => a.displaySlot - b.displaySlot)
        .map(async adapter => await adapter.toDisplay())
        .join('\n')

    await ssd1306.message.write(
        `${deviceName}-${deviceId}
------------------------------------    
${sensorData}`)

    await runAll(adapters, routines)
}, 1 * Seconds)