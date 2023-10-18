import { deviceIdentifier } from "@devicescript/core";
import { SSD1306Driver, SSD1306Options, startCharacterScreenDisplay } from "@devicescript/drivers";
import { configureHardware } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_wroom_c";
import { DeviceConfig, PeripheralsConfig, RoutinesConfig } from "./config";
import { ScreenColumns, ScreenHeight, ScreenRows, ScreenWidth, Seconds } from "./constants";
import { DriverStore } from "./driver-store";
import { DevicePeripheralTypes, PeripheralAdapter, PeripheralAdapterFactory, PeripheralRecords, PeripheralType } from "./peripherals";
import { RoutineOrchestrator } from "./routine-orchestrator";

configureHardware({
    i2c: {
        pinSCL: pins.P22,
        pinSDA: pins.P21
    }
})

const deviceConfig: DeviceConfig = {
    name: "node-1",
    peripherals: {
        foo: { name: "Light", type: PeripheralType.LightLevel, display: true, invert: true },
        bar: { name: "Soil", type: PeripheralType.SoilMoisture, display: true, },
        baz: { name: "Lamp", type: PeripheralType.Relay, display: true },
    },
    routines: {
        foo: {
            conditions: {
                allOf: [
                    { between: [0, 0.25] },
                ]
            },
            actions: {
                setValue: {
                    target: "baz",
                    value: true,
                    otherwise: false
                }
            }
        }
    }
}


const deviceId = deviceIdentifier("self");
const { name: deviceName, peripherals, routines } = deviceConfig
const adapters = initializeAdapters(peripherals)
const routineOrchestrator = new RoutineOrchestrator()
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

    await routineOrchestrator.runAll(adapters, routines)
}, 1 * Seconds)
