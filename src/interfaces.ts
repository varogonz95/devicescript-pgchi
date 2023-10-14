
export interface Thresholds {
    min: number | boolean;
    max: number | boolean;
}

export interface Condition {
    type: string;
    // Define properties specific to each condition type
}

export interface Action {
    type: string;
    condition: Condition;
    output: {
        type: string;
        value: number | boolean;
    };
}

export interface SensorReadings {
    value: number | boolean;
    unit?: string;
}

export interface Routine {
    sensorName: string;
    sensorType: string;
    readings: SensorReadings;
    thresholds: Thresholds;
    action: Action;
}

export interface SensorConfig {
    pin: number;
    name: string;

}

export interface DeviceConfiguration {
    sensors: SensorConfig[]
    routines: Routine[];
}

