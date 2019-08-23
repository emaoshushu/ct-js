window.migrationProcess = window.migrationProcess || [];

/* CHANGELOG
 * Rename room.tiles into room.tileLayers, decompose tile patches of more than 1 tile down into individual pieces
 */

(function () {
    const patchIntoTiles = (patch, project) => {
        /**
         * Previous data included a `grid` entry, which was an array with values:
         * - a starting column;
         * - a starting row;
         * - column span;
         * - row span.
         *
         * @returns {Array<Object>} An array of individual tiles.
         **/
        const texture = project.textures.find(tex => tex.uid === patch.texture);
        const tiles = [];
        for (let x = 0; x < patch.grid[2]; x++) {
            for (let y = 0; y < patch.grid[3]; y++) {
                tiles.push({
                    x: patch.x + x * texture.width,
                    y: patch.y + y * texture.height,
                    texture: patch.texture,
                    frame: x + patch.grid[0] + (y + patch.grid[1]) * texture.grid[0]
                });
            }
        }
        return tiles;
    };
    window.migrationProcess.push({
        version: '1.0.0-next-4',
        process: project => new Promise((resolve) => {
            for (const room of project.rooms) {
                room.tileLayers = room.tileLayers || [];
                for (const oldLayer of room.tiles) {
                    const newLayer = {
                        depth: oldLayer.depth,
                        tiles: []
                    };
                    for (const patch of (oldLayer.tiles)) {
                        newLayer.tiles.push(...patchIntoTiles(patch, project));
                    }
                    room.tileLayers.push(newLayer);
                }
                delete room.tiles;
                room.x = room.x || 0; // The starting position of the camera
                room.y = room.y || 0;
            }
            resolve();
        })
    });
})();
