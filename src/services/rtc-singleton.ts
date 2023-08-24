import { RealTimeClock, assert } from "@devicescript/core";

export class RealTimeClockSingleton {
    private static instance: RealTimeClock
    
    private constructor() {
    }
    
    public static getInstance(): RealTimeClock {
        if (!this.instance)
            this.instance = new RealTimeClock()
        return this.instance
    }
}