
import { Game } from "../game"
import { Connection } from "../../connection/connection"
import { DialogueOptionPacket } from "../../connection/packet"
import { Observable } from "./observable"

export class Dialogue {

    public readonly id: number
    public readonly name: string[]
    public readonly lines: string[][]
    public readonly options: string[]

    constructor(id: number, name: string[], lines: string[][], options: string[]) {
        this.id = id
        this.name = name
        this.lines = lines
        this.options = options
    }

}

export class DialogueModel {

    private readonly connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    public readonly observable = new Observable<Dialogue>(null)

    public clickOption(id: number, index: number) {
        this.connection.send(new DialogueOptionPacket(id, index))
    }

}
