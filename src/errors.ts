export class UnsupportedSensorServerError extends Error {
    constructor(sensorType: string) {
        super(`Unsupported server for sensor type ${sensorType}`);
    }
}
