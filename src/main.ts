import { pins, board } from "@dsboard/esp32_wroom_devkit_c"
import { SSD1306Driver, startCharacterScreen } from "@devicescript/drivers"
import { configureHardware } from "@devicescript/servers"

configureHardware({
    i2c:{
        pinSDA: pins.P21,
        pinSCL: pins.P22,
    }
})

const ssd = new SSD1306Driver({
    width: 128,
    height: 64,
    devAddr: 0x3d
})

const screen = await startCharacterScreen(ssd)
await screen.message.write(
`°( )° 
( O ) 
°( )° 
  |   
  |/  
  |   
~~~~~ `)