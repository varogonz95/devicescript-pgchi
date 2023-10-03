import { Sensor } from "@devicescript/core";
import { startLightLevel } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_devkit_c";
import { DeviceConfig, GPIOPin, HardwareIdentifiers } from "./core";

const Seconds = 1000;

const mockConfig: DeviceConfig = {
    sensors: {
        lightLevel: { pin: pins.P13, },
        soilMoisture: { pin: pins.P14, },
    },
    routines: {
        lightLevel: {
            condition: {
                subject: "$this",
                comparison: "between",
                value: [0, 25]
            },
            actions: {
                setValue: {
                    target: "relay_lamp",
                    value: true,
                    duration: 10 * Seconds
                }
            }
        }
    }
}

const serverFactory = (identifier: string, pin: GPIOPin): Sensor => {
    const hardwareIdentifier = identifier as HardwareIdentifiers

    if (hardwareIdentifier === "lightLevel") {
        return startLightLevel({ pin: pin })
    }

    return null
}

const configure = (config: DeviceConfig) => {
    for (const key in config.sensors) {
        const server = serverFactory(key, config.sensors[key].pin)
        console.log(server)
    }
}

configure(mockConfig)