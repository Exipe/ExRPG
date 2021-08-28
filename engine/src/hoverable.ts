
export interface Hoverable {

    inClickBox(x: number, y: number): boolean 

    startHover(): void
    stopHover(): void

}