import * as tt from 'three-tile'
import * as plugin from "three-tile/plugin"

export default {
    name: 'TileMap',
    label: '地图瓦片',
    create(_, { }) {
        const map = new tt.TileMap({
            imgSource: [new plugin.ArcGisSource(), new plugin.GDSource()],
            minLevel: 2,
            maxLevel: 18,
            lon0: 90
        })
        map.scale.multiplyScalar(0.001)
        map.rotateX(-Math.PI / 2)
        return map
    }
}