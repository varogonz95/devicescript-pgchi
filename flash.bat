@echo off

set /p port=Connected device port: 
set /p firmware=Firmware to flash: 

echo Erasing flash...
python -m esptool --chip esp32 --port %port% erase_flash

echo Flashing firmware '%firmware%'
python -m esptool --chip esp32 --port %port% --baud 460800 write_flash -z 0x1000 %firmware%

cd ..

echo Flash completed!