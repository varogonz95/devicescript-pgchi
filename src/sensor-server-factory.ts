import { Pin, AnalogInPin } from "@devicescript/core"
import { startLightLevel } from "@devicescript/servers"

export const serverFactory = (sensorName: string, pin: Pin) => {
    if (sensorName === "lightLevel")
        return startLightLevel({pin: pin as AnalogInPin})
    //...
}