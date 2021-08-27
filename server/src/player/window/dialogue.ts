import { yellow } from "../../util/color"
import { Player } from "../player"
import { PrimaryWindow } from "./p-window"

type DialogueOption = [ string, () => Dialogue ]

export class Dialogue implements PrimaryWindow {

    public readonly name: string[]
    public readonly lines: string[][]
    private readonly dialogueOptions = [] as DialogueOption[]

    public next = null as Dialogue

    constructor(name: string | string[], lines: (string | string[])[]) {
        if(typeof(name) == 'string') {
            name = [yellow.toString(), `「${name}」`]
        }

        this.name = name
        this.lines = lines.map(l => typeof(l) == 'string' ? [l] : l)
    }

    public readonly id = "Dialogue"

    open(p: Player) {
        p.sendDialogue(this)
    }

    public addOption(option: string, callback: () => Dialogue) {
        this.dialogueOptions.push([option, callback])
    }

    public get options() {
        return this.dialogueOptions.length > 0 ? this.dialogueOptions.map(option => option[0])
            : [ "Continue" ]
    }

    public handleOption(index: number) {
        if(index >= this.dialogueOptions.length) {
            return this.next
        }

        return this.dialogueOptions[index][1]()
    }

}