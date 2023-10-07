import { ComparisonTypes } from "./routines";

export class UnsupportedComparisonError extends Error {
    constructor(comparison: ComparisonTypes, value: any) {
        super(`Cannot use ${comparison} operator with value of type ${typeof value}`);
    }
}

export class UnsupportedSensorServerError extends Error {
    constructor(sensorType: string) {
        super(`Unsupported server for sensor type ${sensorType}`);
    }
}
