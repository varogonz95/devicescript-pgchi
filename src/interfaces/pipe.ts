import { Observable, interval } from "@devicescript/observables";

export class SensorPipeline {

    private _sensorObservables: Record<string, Observable<any>[]>
    private _interval: Observable<number>
    private _whenPredicateResult: boolean

    public from<T>(observables: Record<string, Observable<T>[]>): SensorPipeline {
        this._sensorObservables = observables
        return this
    }

    public interval(pollTime: number): SensorPipeline {
        this._interval = interval(pollTime)
        return this
    }

    public when(predicate: () => boolean): SensorPipeline {
        this._whenPredicateResult = predicate()
        return this
    }
}