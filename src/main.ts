import { Register, Sensor } from "@devicescript/core";
import { Observable, OperatorFunction, auditTime, collectTime, filter, iif, map } from "@devicescript/observables";
import { BaseServiceConfig, LightLevelConfig, SoilMoistureConfig, startLightLevel, startSoilMoisture } from "@devicescript/servers";
import { pins } from "@dsboard/esp32_devkit_c";
import { DeviceConfig, RoutineTypes, RoutinesConfig, SensorsConfig } from "./config";
import { UnsupportedSensorServerError } from "./errors";
import { IOModesMap, SensorType, SensorTypesMap } from "./types";
import { InputSensorAdapter, SensorData } from "./sensor";
import { SupportedInputSensors } from "./core";

const Seconds = 1000;

const deviceConfig: DeviceConfig = {
    sensors: {
        "foo": { type: SensorType.LightLevel, config: { pin: pins.P32 } },
        "bar": { type: SensorType.SoilMoisture, config: { pin: pins.P32 } },
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

const startSensorServer = (type: SensorType, config: BaseServiceConfig): Sensor => {
    switch (type) {
        case SensorType.LightLevel:
            return startLightLevel(config as LightLevelConfig)

        case SensorType.SoilMoisture:
            return startSoilMoisture(config as SoilMoistureConfig)

        default:
            throw new UnsupportedSensorServerError(type)
    }
}

const { sensors } = deviceConfig
let sensorServers: Record<string, Sensor> = {}

for (const key in sensors) {
    const sensor = sensors[key]
    sensorServers[key] = startSensorServer(sensor.type, sensor.config)
}

let serverRegisters: Record<string, Observable<any>> = {}
for (const key in sensorServers) {
    const server = sensorServers[key]
    if (IOModesMap[key] === "In") {
        const inputSensor = server as SupportedInputSensors
        const sensorAdapter = new InputSensorAdapter(inputSensor)
        serverRegisters[key] = sensorAdapter.reading.pipe()
    }
}

collectTime(serverRegisters, 1 * Seconds)
    .pipe(toSensor())
    .subscribe(observer => {
        observer
    })

type SensorDataRecord = Record<string, SensorData>;

function toSensor<T extends Record<string, unknown>>(config: RoutinesConfig): OperatorFunction<T, SensorDataRecord> {
    return function operator(source: Observable<T>) {
        return source.pipe(map(sensors => {
            const sensorRecords: Record<string, SensorData> = {}

            for (const key in sensors) {
                sensorRecords[key] = {
                    type: SensorType.LightLevel,
                    value: sensors[key as string] as number,
                }
            }

            return sensorRecords
        }))
    }
}

function routine(routineType: RoutineTypes): OperatorFunction<Record<string, SensorData>, SensorDataRecord> {
    const { actions, condition } = routineType
    const { comparison, subject, value } = condition

    if (typeof value === "object") {
        if (comparison === "between") {
            source.pipe(filter(sensors => value[0] < sensors[subject].value && sensors[subject].value < value[1]))
        }
    }

    if (typeof value === "number") {
        if (comparison === "equals") {
            source.pipe(filter(sensors => value === sensors[subject].value))
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
