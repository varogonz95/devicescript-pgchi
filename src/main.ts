import { deviceIdentifier } from "@devicescript/core";
import { catchError, collectTime, tap } from "@devicescript/observables";
import { connectToIoTHub } from "./api/azure-iot-hub";
import { DeviceConfig } from "./config";
import { seconds } from "./constants";
import { PeripheralType } from "./peripherals";
import { initializeAdapters, publishSensorData, toReadingRecords, waitTillDevicesAreBound } from "./utils";

const deviceId = deviceIdentifier("self");

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

const altDeviceId = "py01";
const iotHubClient = await connectToIoTHub(altDeviceId);

const records = toReadingRecords(adapters);

// //* Publish sensor data to topic
const publishTopic = `devices/${altDeviceId}/messages/events/`;

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
    });

//* Subscribe to topic messages
const subscribeTopic = `devices/${altDeviceId}/messages/devicebound/#`;
const iotHubSubscription = await iotHubClient.subscribe(subscribeTopic);

iotHubSubscription
    .pipe(
        tap(message => console.debug("Message recieved: ", message.content.toString()))
    )
    .subscribe(message => {
        const jsonContent = message.content.toString();
        const payload = JSON.parse(jsonContent);

        console.log("New config recieved.");
        console.debug("Message", jsonContent);

        // TODO: Convert message to config obj
        defaultConfig = { ...payload } as DeviceConfig

        // TODO: Run the new config

    });