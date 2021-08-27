
/*
Some predefined colors that can be used in chat messages
*/

export class Color {

    public readonly red: number
    public readonly green: number
    public readonly blue: number

    constructor(r: number, g: number, b: number) {
        this.red = r
        this.green = g
        this.blue = b
    }

    public toString() {
        return `/rgb(${this.red},${this.green},${this.blue},{})`
    }

}

export let yellow = new Color(255,230,120)
export let green = new Color(150,230,120)
export let cyan = new Color(155,255,255)
export let red = new Color(255, 115, 115)