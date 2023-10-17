import { SSD1306Driver, SSD1306Options, startCharacterScreen, startCharacterScreenDisplay } from "@devicescript/drivers";
import { interval } from "@devicescript/observables";
import { configureHardware } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_wroom_c";
import { DeviceConfig, RoutinesConfig } from "./config";
import { ScreenColumns, ScreenHeight, ScreenRows, ScreenWidth, Seconds } from "./constants";
import { DevicePeripheralTypes, PeripheralAdapter, PeripheralAdapterFactory, PeripheralType } from "./peripherals";
import { deviceIdentifier } from "@devicescript/core";

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
        baz: { name: "Lamp", type: PeripheralType.Relay },
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


type PeripheralAdapters = PeripheralAdapter<DevicePeripheralTypes>

function initializeAdapters(routines: RoutinesConfig): PeripheralAdapters[] {
    let adapters: PeripheralAdapters[] = []
    for (const key in peripherals) {
        const config = peripherals[key]
        const peripheral = PeripheralAdapterFactory.create(config, routines[key]);
        adapters.push(peripheral)
    }
    return adapters
}

const deviceId = deviceIdentifier("self");
const { name: deviceName, peripherals, routines } = deviceConfig
const ssd1306Options: SSD1306Options = {
    width: ScreenWidth,
    height: ScreenHeight,
    devAddr: 0x3c
};
const ssd1306 = await startCharacterScreenDisplay(
    new SSD1306Driver(ssd1306Options),
    {
        columns: ScreenColumns,
        rows: ScreenRows,
    })
const adapters = initializeAdapters(routines)
// DriverStore.createInstance(adapters)


interval(1 * Seconds)
    .subscribe(async time => {
        const sensorData = adapters
            .filter(adapter => adapter.display)
            .sort((a, b) => a.displayRow - b.displayRow)
            .map(async adapter => await adapter.toDisplay())
            .join('\n')

        // console.data(sensorData);

        await ssd1306.message.write(
            `${deviceName}-${deviceId}

${sensorData}`)
    })
