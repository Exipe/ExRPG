
export type AnchorPoint = 0 | 1 | 2

export function resizeOffset(width: number, height: number, oldWidth: number, oldHeight: number, 
    anchorX: AnchorPoint, anchorY: AnchorPoint) {
        let offsetX = 0
        let offsetY = 0

        if(anchorX == 1) { // center
            offsetX = width / 2 - oldWidth / 2
        } else if(anchorX == 2) { // right
            offsetX = width - oldWidth
        }

        if(anchorY == 1) { // center
            offsetY = height / 2 - oldHeight / 2
        } else if(anchorY == 2) { // bottom
            offsetY = height - oldHeight
        }

        return [offsetX, offsetY]
}