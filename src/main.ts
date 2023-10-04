import { LightLevel, Sensor } from "@devicescript/core";
import { startLightLevel } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_devkit_c";
import { DeviceConfig, HardwareIdentifier } from "./config";
import { threshold, throttleTime } from "@devicescript/observables";

const Seconds = 1000;

const mockConfig: DeviceConfig = {
    sensors: {
        lightLevel: { pinNumber: pins.P13.gpio, },
        soilMoisture: { pinNumber: pins.P14.gpio, },
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

const sensorFactory = (identifier: string): Sensor => {
    const hardwareIdentifier = identifier as HardwareIdentifier

    if (hardwareIdentifier === "lightLevel") {
        return startLightLevel({ pin: pins.P35 })
    }

    return null
}

const configure = (config: DeviceConfig) => {
    for (const key in config.sensors) {
        const sensor = sensorFactory(key)

        if (sensor instanceof LightLevel) {
            sensor.reading
            .pipe(throttleTime(1 * Seconds))
            .subscribe(lightLevel => {
            })
        }
    }
}

configure(mockConfig)