
import { Player } from "./player"
import { Packet, ConnectResponse, MessagePacket } from "../connection/outgoing-packet"
import { Connection } from "../connection/connection"
import { saveProgress } from "./progress/save-progress"
import { Progress } from "./progress/progress"
import fs from "fs"
import bcrypt from "bcrypt"

function savePath(playerName: string) {
    return `players/${playerName.toLowerCase()}.json`
}

interface PlayerSave {
    username: string,
    password: string,
    progress: Progress
}

function save(save: PlayerSave) {
    const stringSave = JSON.stringify(save, null, '\t')
    fs.writeFileSync(savePath(save.username), stringSave)
}

/*
Letters, numbers, spaces
No spaces in the beginning or the end
No 2 spaces in a row
*/
const NAME_REGEX = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/

export class PlayerHandler {

    private idCount = 0
    private players: Player[] = []

    public broadcast(packet: Packet) {
        this.players.forEach(player => {
            player.send(packet)
        })
    }

    public globalMessage(...message: string[]) {
        this.broadcast(new MessagePacket(message))
    }

    public get(id: number) {
        return this.players.find(p => p.id == id)
    }

    public getName(name: string) {
        return this.players.find(p => p.name.toLowerCase() == name.toLowerCase())
    }

    public get count() {
        return this.players.length
    }

    public remove(removePlayer: Player) {
        if(removePlayer.connectionState == "playing") {
            const progress = saveProgress(removePlayer)
            save({
                username: removePlayer.name,
                password: removePlayer.password,
                progress: progress
            })
        }

        this.players = this.players.filter(player => player != removePlayer)
    }

    private preparePlayer(connection: Connection, name: string, password: string, progress = null as Progress) {
        const id = this.idCount++
        const player = new Player(connection, id, name, password, progress)
        this.players.push(player)

        connection.state = "connected"
        connection.send(new ConnectResponse(true))
    }

    public register(username: string, password: string, connection: Connection) {
        if(username.length > 12 || !NAME_REGEX.test(username)) {
            connection.send(new ConnectResponse(false, "That username is invalid."))
            return
        }

        if(fs.existsSync(savePath(username))) {
            connection.send(new ConnectResponse(false, "That username is already taken."))
            return
        }

        password = bcrypt.hashSync(password, 10)

        save({
            username: username,
            password: password,
            progress: null
        })

        this.preparePlayer(connection, username, password)
    }

    public async login(username: string, password: string, connection: Connection) {
        if(this.getName(username) != null) {
            connection.send(new ConnectResponse(false, "User is already signed in."))
            return
        }

        const invalidDetails = new ConnectResponse(false, "Invalid username or password.")

        const path = savePath(username)
        if(!fs.existsSync(path)) {
            connection.send(invalidDetails)
            return
        }

        const playerSave = JSON.parse(fs.readFileSync(path, "utf-8")) as PlayerSave
        if(!bcrypt.compareSync(password, playerSave.password)) {
            connection.send(invalidDetails)
            return
        }

        this.preparePlayer(connection, playerSave.username, playerSave.password, playerSave.progress)
    }

}
