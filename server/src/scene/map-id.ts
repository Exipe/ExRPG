
export type MapId = "main" | "demo" | "dungeon" | "skeleton_boss_chamber"

export const maps = [ "main", "demo", "dungeon", "skeleton_boss_chamber" ] as MapId[]

export function isMapId(id: string): id is MapId {
    return maps.includes(id as MapId)
}