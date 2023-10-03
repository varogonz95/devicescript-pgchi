
interface Config {
  sensors: {
    "sensorId": {
      label: "servo motor"
      pin: 2,
      startingValue: 0, // available if mode = output
      mode: "input" | "output" //...
    }
  },
  routines: {
    "sensorId": {
      schedule: {
        startAt: "2023-09-23 ....",
        endAt: "2023-09-23 ....", // optional
        // optional
        repeats: true | "yearly" | "monthly" //...
      },
      condition: {
        // sensor value
        subject: "$this" | "sensorId",
        // boolean expressions,
        comparison: "greaterThan" | "equals" | "...",
        value: 123
        // value ranges,
        between: [1, 2]
        //...
      },
      action: {
        pushNotification: {
          title: "...",
          message: ""
        },
        setValue: {
          target: "$this" | "sensorId",
          value: 123 | true | false,
          duration: 1000, // optional 
          durationUntil: "date..."
        },
        sendEmail: {
          recipients: "...",
          title: "...",
          text: "...",
          html: "..."
        },
        webhook: {
          url: "...",
          data: "..."
        }
      }
    }
  }
}