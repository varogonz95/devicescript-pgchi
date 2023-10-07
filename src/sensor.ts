import { Register } from "@devicescript/core";
import { SupportedInputSensors } from "./core";
import { SensorType } from "./types";

export interface IReadbleSensor<T> {
    readonly reading: Register<T>
}

export class InputSensorAdapter<T, S extends SupportedInputSensors> implements IReadbleSensor<T>{
    readonly reading: Register<T>;

    constructor(private server: S) {
        // this.reading = server.reading;
    }
}

export interface SensorData {
    type: SensorType;
    value: number;
}
