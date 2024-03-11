import { deviceIdentifier } from "@devicescript/core";
import { MQTTClient, startMQTTClient } from "@devicescript/net";
import { catchError, collect, interval, tap, throttleTime } from "@devicescript/observables";
import { readSetting } from "@devicescript/settings";
import { getToken } from "./api/token-generator";
import { DeviceConfig } from "./config";
import { seconds } from "./constants";
import { PeripheralType } from "./peripherals";
import { initializeAdapters, toReadingRecords } from "./utils";

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

const defaultConfig: DeviceConfig = {
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

const altDeviceId = "py01"
const host = "pgotchi-dev-east-iothub.azure-devices.net";
const port = 8883;

const username = `${host}/${altDeviceId}/?api-version=2021-04-12`;
const uri = host + "/devices/" + altDeviceId;
const key = await readSetting('AZURE_IOT_KEY');
const { token: password } = await getToken(uri, key);

const mqttClient = await startMQTTClient({
    host,
    port,
    username,
    password,
    clientId: altDeviceId,
});
mqttClient.onerror.subscribe(async err => {
    console.error('FUCK', err);
    await mqttClient.stop();
});


// //* Subscribe to topic messages
// const subscribeTopic = `devices/${altDeviceId}/messages/devicebound/#`;
// const mqttSubscription = await mqttClient.subscribe(subscribeTopic);

// mqttSubscription.pipe(
//     catchError((err, message) => {
//         console.error("Mqtt Error: ", err);
//         return message;
//     }),
//     tap(message => console.debug("Message recieved: ", message.content.toString()))
// )
//     .subscribe(message => {
//         console.log("New config recieved.");
//         // TODO: Convert message to config obj
//         // TODO: Run the new config
//     });

const records = toReadingRecords(adapters);

// //* Publish sensor data to topic
const publishTopic = `devices/${altDeviceId}/messages/events/`;

// collect(
//     records,
//     interval(0).pipe(throttleTime(seconds(5))))
//     .pipe(
//         catchError((err, sensors) => {
//             console.error(err);
//             return sensors;
//         }),
//         tap(sensors => console.data({ ...sensors }))
//     )
//     .subscribe(async sensors => {
//         await publishSensorData(mqttClient, publishTopic, sensors);
//     });

async function publishSensorData<T>(client: MQTTClient, topic: string, sensors: Record<string, T>) {
    const message = JSON.stringify({ ...sensors });
    const success = await client.publish(topic, message);
    console.debug("Message published: ", success);
}