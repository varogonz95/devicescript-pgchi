export const seconds = (secs: number) => secs * 1000
export const minutes = (mins: number) => mins * seconds(60)
export const hours = (hrs: number) => hrs * minutes(60)

export const ScreenWidth = 128
export const ScreenHeight = 64
export const ScreenCharWidth = 7
export const ScreenCharHeight = 8
export const ScreenColumns = Math.floor(ScreenWidth / ScreenCharWidth)
export const ScreenRows = Math.floor(ScreenHeight / ScreenCharHeight)
