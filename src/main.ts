import { Sensor } from "@devicescript/core";
import { collectTime } from "@devicescript/observables";
import { LightLevelConfig, SoilMoistureConfig, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_devkit_c";
import { DeviceConfig, PeripheralConfigTypes } from "./config";
import { UnsupportedSensorServerError } from "./errors";
import { DevicePeripheralTypes, PeripheralType, PeripheralAdapter, PeripheralAdapterFactory } from "./peripherals";

const Seconds = 1000;

const deviceConfig: DeviceConfig = {
    peripherals: {
        foo: { type: PeripheralType.LightLevel, config: { pin: pins.P32 } },
        bar: { type: PeripheralType.SoilMoisture, config: { pin: pins.P32 } },
    },
    routines: {
        foo: {
            condition: {
                allOf: [
                    { between: [1, 2] }
                ]
            },
            actions: {
                set: {
                    target: "relay_lamp",
                    value: true,
                    duration: 10 * Seconds
                }
            }
        }
    }
}

const startSensorServer = (sensor: PeripheralConfigTypes): Sensor => {
    switch (sensor.type) {
        case PeripheralType.LightLevel:
            return startLightLevel(sensor.config as LightLevelConfig)

        case PeripheralType.SoilMoisture:
            return startSoilMoisture(sensor.config as SoilMoistureConfig)

        default: 
            const config = sensor as PeripheralConfigTypes
            throw new UnsupportedSensorServerError(config.type)
    }
}

const { peripherals: sensors } = deviceConfig

type ServerRecord = Record<string, PeripheralAdapter<DevicePeripheralTypes>>

let serverAdapterRecords: ServerRecord = {}
for (const key in sensors) {
    const sensor = sensors[key]
        serverAdapterRecords[key] = PeripheralAdapterFactory.create(sensor.type, sensor.config)
}

/* const toSensorDataRecords = <T extends Record<string, unknown>>(): OperatorFunction<T, SensorDataRecord> => {
    return function operator(source: Observable<T>) {
        return source.pipe(map((sensors) => {
            const sensorRecords: SensorDataRecord = {}

            for (const key in sensors) {
                sensorRecords[key] = {
                    type: SensorType.LightLevel,
                    value: sensors[key as string] as number,
                }
            }

            return sensorRecords
        }))
    }
} */

/* function toSensorCommand<T extends SensorDataRecord>(servers: ServerRecord): OperatorFunction<T, SensorCommandRecord> {
    return function operator(source: Observable<T>) {
        return source.pipe(map((sensors) => {
            const commands: SensorCommandRecord = {}

            for (const key in sensors) {
                const data = sensors[key]
                commands[key] = {
                    data,
                    execute: (routine) => {
                        const { actions, condition, } = routine as Routine
                        const { comparison, subject, value } = condition
                        const { pushNotification, sendEmail, setValue, webhook } = actions

                        if (typeof value === "object") {
                            if (comparison === "between") {
                                source.pipe(filter(sensors => value[0] < sensors[subject].value && sensors[subject].value < value[1]))
                            }
                        }

                        if (typeof value === "number") {
                            if (comparison === "equals" && data.value === sensors[subject].value) {

                                if (setValue) {
                                    const { target, value, duration, durationUntil } = setValue
                                    const serverAdapter = new ReadableSensorAdapter()
                                    servers[target].
                                }

                            }
                            else if (comparison === "greaterThan") {
                                source.pipe(filter(sensors => value > sensors[subject].value))
                            }
                            else if (comparison === "greaterOrEqualsTo") {
                                source.pipe(filter(sensors => value >= sensors[subject].value))
                            }
                            else if (comparison === "lessThan") {
                                source.pipe(filter(sensors => value < sensors[subject].value))
                            }
                            else if (comparison === "lessOrEqualsTo") {
                                source.pipe(filter(sensors => value <= sensors[subject].value))
                            }
                        }
                    }
                }
            }

            return commands
        }))
    }
} */


collectTime(sensorRecords, 1 * Seconds)
    // .pipe(toSensorDataRecords())
    // .pipe(toSensorCommand())
    .subscribe(observer => { 
        // TODO: Sensor actions logic here...
    })