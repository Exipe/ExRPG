
import { Game } from "./game";
import { Goal } from "./character/path-finder";
import { ObjectActionPacket } from "../connection/packet";
import { ObjectEntity } from "exrpg";

export function initObjects(game: Game) {
    const engine = game.engine

    let clickObject = (obj: ObjectEntity, action: string) => {
        const data = obj.data
        const goal: Goal = {
            x: obj.tileX + (data.width - 1) / 2,
            y: obj.tileY - (data.depth - 1) / 2,
            width: data.width,
            height: data.depth,
            distance: 1
        }

        game.walkToGoal(goal)
        if(action != null) {
            game.connection.send(new ObjectActionPacket(data.id, action, obj.tileX, obj.tileY))
        }
    }

    engine.inputHandler.onObjectContext = obj => {
        const data = obj.data
        data.options.forEach(option => {
            const text = `${option[0]} /rgb(150,230,120,${data.name})`
            game.ctxMenu.add([text, () => {
                clickObject(obj, option[1])
            }])
        })
    }

    engine.inputHandler.onObjectClick = obj => {
        const action = obj.data.options.length > 0 ? obj.data.options[0][1] : null
        clickObject(obj, action)
    }
}