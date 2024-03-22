import { deviceIdentifier } from "@devicescript/core";
import { catchError, collectTime, tap } from "@devicescript/observables";
import { connectToIoTHub } from "./api/azure-iot-hub";
import { registerDevice } from "./api/register-device";
import { seconds } from "./constants";
import { DeviceConfig } from "./models/config";
import { PeripheralType } from "./models/peripherals";
import { RoutineOrchestrator } from "./routine-orchestrator";
import { initializeAdapters, publishSensorData, toReadingRecords, waitTillDevicesAreBound } from "./utils";

const deviceId = deviceIdentifier("self");
await registerDevice(deviceId)
// const ssd1306Options: SSD1306Options = {
//     width: ScreenWidth,
//     height: ScreenHeight,
//     devAddr: 0x3c
// }
// const ssd1306 = await startCharacterScreenDisplay(
//     new SSD1306Driver(ssd1306Options),
//     {
//         columns: ScreenColumns,
//         rows: ScreenRows,
//     }
// )

let defaultConfig: DeviceConfig = {
    peripherals: {
        light: { name: "Light", type: PeripheralType.LightLevel, display: true, reverse: true },
        soil: { name: "Soil", type: PeripheralType.SoilMoisture, display: true, },
        lamp: { name: "Lamp", type: PeripheralType.Relay, display: true },
        pump: { name: "Pump", type: PeripheralType.Relay, display: true },
    },
    routines: {
        light: {
            conditions: {
                allOf: [
                    { between: [0, 0.25] },
                ]
            },
            actions: {
                setValue: {
                    target: "lamp",
                    value: true,
                    otherwise: false
                }
            }
        },
        soil: {
            conditions: {
                allOf: [
                    { between: [0, 0.1] },
                ]
            },
            actions: {
                setValue: {
                    target: "pump",
                    value: true,
                    otherwise: false
                }
            }
        },
    },
}
const { peripherals, routines } = defaultConfig;
const adapters = initializeAdapters(peripherals);

await waitTillDevicesAreBound(adapters);

const iotHubClient = await connectToIoTHub(deviceId);

const records = toReadingRecords(adapters);

// //* Publish sensor data to topic
const publishTopic = `devices/${deviceId}/messages/events/`;

collectTime(
    records,
    seconds(5)
)
    .pipe(
        catchError((err, sensors) => {
            console.error(err);
            return sensors;
        }),
        tap(sensors => console.data({ ...sensors }))
    )
    .subscribe(async sensors => {
        await publishSensorData(iotHubClient, publishTopic, sensors);
        // await RoutineOrchestrator.runAll(adapters, routines)
    });

// //* Subscribe to topic messages
// const subscribeTopic = `devices/${deviceId}/messages/devicebound/#`;
// const iotHubSubscription = await iotHubClient.subscribe(subscribeTopic);

// iotHubSubscription
//     .pipe(
//         tap(message => console.debug("Message recieved: ", message.content.toString()))
//     )
//     .subscribe(message => {
//         const jsonContent = message.content.toString();
//         const payload = JSON.parse(jsonContent);

//         console.log("New config recieved.");
//         console.debug("Message", jsonContent);

//         // TODO: Convert message to config obj
//         defaultConfig = { ...payload } as DeviceConfig

//         // TODO: Run the new config

//     });