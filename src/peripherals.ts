import * as ds from "@devicescript/core";
import { startLightLevel, startRelay, startSoilMoisture } from "@devicescript/servers";
import { Actions } from "./actions";
import { IPeripheralConfig, PeripheralConfigTypes } from "./config";
import { LampRelayPin, LightLevelPin, ScreenColumns, SoilMoisturePin } from "./constants";
import { DriverStore } from "./driver-store";
import { UnsupportedSensorServerError } from "./errors";
import { BaseRoutine, ConditionType, Routines, isAllOfCondition, isAnyOfCondition, isRangeConditionType, isScalarConditionType } from "./routines";

export enum PeripheralType {
    LightLevel = 'lightLevel',
    SoilMoisture = 'soilMoisture',
    Relay = "relay"
}

export type AnalogInPeripherals = ds.LightLevel | ds.SoilMoisture
export type OutPeripherals = ds.Relay
export type DevicePeripheralTypes = AnalogInPeripherals | OutPeripherals;

export type HandlerArgs = [boolean, Partial<Actions>];

export abstract class PeripheralAdapter<T extends DevicePeripheralTypes, R = any> {
    public readonly name: string
    public readonly invert: boolean
    public readonly autostart: boolean
    public readonly display: boolean
    public readonly displayRow: number
    public readonly register: ds.Register<R>

    protected readonly sensor: T
    public _lastRead: R
    protected _driverStore: DriverStore

    constructor(
        peripheral: PeripheralConfigTypes,
        protected readonly _routine?: BaseRoutine) {

        this.sensor = this.startServer()
        this.register = this.initRegister()
        this._driverStore = DriverStore.getInstance()

        this.name = peripheral.name || peripheral.type
        this.invert = peripheral.invert || false
        this.autostart = peripheral.autostart || false
        this.display = peripheral.display || false
        this.displayRow = peripheral.displayRow || 0

    }

    protected async __read() {
        this._lastRead = await this.register.read()
        return this._lastRead
    }

    public async read() {
        return await this.__read()
    }

    public async write(value: R) {
        if (this._lastRead !== value)
            return await this.register.write(value)
    }

    public async runRoutine(): Promise<void> {
        const meetsConditions = this.conditionsMet()
        const { actions } = this._routine

        if (actions.setValue) {
            const { target, value, otherwise, duration, durationUntil } = actions.setValue
            const newValue = meetsConditions ? value : otherwise
            const targetDriver = this._driverStore.get(target)
            await targetDriver.write(newValue)

            if (duration) {
                // await ds.delay(duration) // TODO: Improve implementation 
                // await targetDriver.write(otherwise)
            }
        }

        if (actions.sendEmail) {
            // TODO: Implement email notification
        }
    }

    public async toDisplay() {
        const value = await this.read()
        return `${this.name}: ${value}`
    }

    protected conditionsMet() {
        const { conditions } = this._routine
        if (isAllOfCondition(conditions)) {
            return this.allOfConditionsMet(conditions.allOf, this._lastRead);
        }

        if (isAnyOfCondition(conditions)) {
            return this.anyOfConditionsMet(conditions.anyOf, this._lastRead);
        }

        return false;
    }

    protected evaluateConditions(conditions: ConditionType[], value: any) {
        const assertions: boolean[] = []

        for (const condition of conditions) {
            if (isScalarConditionType(condition)) {
                if (condition.equals) {
                    assertions.push(value === condition.equals)
                }
                else if (condition.greaterOrEqualsTo) {
                    assertions.push(value >= condition.greaterOrEqualsTo)
                }
                else if (condition.greaterThan) {
                    assertions.push(value > condition.greaterThan)
                }
                else if (condition.lessOrEqualsTo) {
                    assertions.push(value <= condition.lessOrEqualsTo)
                }
                else if (condition.lessThan) {
                    assertions.push(value < condition.lessThan)
                }
                else if (condition.notEquals) {
                    assertions.push(value !== condition.notEquals)
                }
                else { }
            }

            if (isRangeConditionType(condition)) {
                if (condition.between) {
                    const [lower, upper] = condition.between
                    assertions.push(lower <= value && value <= upper)
                }
                else { }
            }
        }
        return assertions
    }

    protected allOfConditionsMet(conditions: ConditionType[], value: any) {
        const assertions = this.evaluateConditions(conditions, value)
        return assertions.every(assertion => assertion === true)
    }

    protected anyOfConditionsMet(conditions: ConditionType[], value: any) {
        const assertions = this.evaluateConditions(conditions, value)
        return assertions.some(assertion => assertion === true)
    }

    protected abstract startServer(): T
    protected abstract initRegister(): ds.Register<R>
}

export class LightLevelAdapter extends PeripheralAdapter<ds.LightLevel, number>  {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.LightLevel>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    public override async read(): Promise<number> {
        const value = await this.__read()
        const newMin = this.invert ? 1 : 0;
        const newMax = this.invert ? 0 : 1;
        return Math.map(value, 0, 1, newMin, newMax)
    }

    protected startServer(): ds.LightLevel {
        return startLightLevel({ pin: ds.gpio(LightLevelPin) })
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }

    public override async toDisplay() {
        const value = await this.read()
        const additionalChars = [':', ' ', '[', ']'].length
        const width = ScreenColumns - this.name.length - additionalChars
        return `${this.name}: [${this.charProgressBar(value, width)}]`
    }

    private charProgressBar(value: number, charWidth: number) {
        const charsLen = Math.map(value, 0, 1, 0, charWidth) - 1
        let bar = ''
        for (let i = 0; i < charsLen; i++) {
            bar += "="
        }
        return bar
    }
}

export class SoilMoistureAdapter extends PeripheralAdapter<ds.SoilMoisture, number>  {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.SoilMoisture>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    protected startServer(): ds.SoilMoisture {
        return startSoilMoisture({ pin: ds.gpio(SoilMoisturePin) })
    }

    protected initRegister(): ds.Register<number> {
        return this.sensor.reading
    }

    public override async toDisplay() {
        const value = await this.read()
        const additionalChars = [':', ' ', ' ', '[', ']'].length
        const width = ScreenColumns - this.name.length - additionalChars
        return `${this.name}:  [${this.charProgressBar(value, width)}]`
    }

    private charProgressBar(value: number, charWidth: number) {
        const charsLen = Math.map(value, 0, 1, 0, charWidth) - 1
        let bar = ''
        for (let i = 0; i < charsLen; i++) {
            bar += "="
        }
        return bar
    }
}

export class RelayAdapter extends PeripheralAdapter<ds.Relay, boolean> {
    constructor(
        peripheral: IPeripheralConfig<PeripheralType.Relay>,
        routine?: Routines) {
        super(peripheral, routine)
    }

    protected startServer(): ds.Relay {
        return startRelay({ pin: ds.gpio(LampRelayPin) })
    }
    protected initRegister(): ds.Register<boolean> {
        return this.sensor.enabled
    }
}

export class PeripheralAdapterFactory {
    public static create(peripheral: PeripheralConfigTypes, routine?: Routines): PeripheralAdapter<DevicePeripheralTypes> {
        switch (peripheral.type) {
            case PeripheralType.LightLevel:
                return new LightLevelAdapter(peripheral, routine)

            case PeripheralType.SoilMoisture:
                return new SoilMoistureAdapter(peripheral, routine)

            case PeripheralType.Relay:
                return new RelayAdapter(peripheral, routine)

            default:
                const type = (peripheral as PeripheralConfigTypes).type
                throw new UnsupportedSensorServerError(type)
        }
    }
}