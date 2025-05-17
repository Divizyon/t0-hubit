import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class Resources extends EventEmitter {
    constructor() {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            // Matcaps
            { name: 'matcapBeige', source: './models/matcaps/beige.png', type: 'texture' },
            { name: 'matcapBlack', source: './models/matcaps/black.png', type: 'texture' },
            { name: 'matcapOrange', source: './models/matcaps/orange.png', type: 'texture' },
            { name: 'matcapRed', source: './models/matcaps/red.png', type: 'texture' },
            { name: 'matcapWhite', source: './models/matcaps/white.png', type: 'texture' },
            { name: 'matcapGreen', source: './models/matcaps/green.png', type: 'texture' },
            { name: 'matcapBrown', source: './models/matcaps/brown.png', type: 'texture' },
            { name: 'matcapGray', source: './models/matcaps/gray.png', type: 'texture' },
            { name: 'matcapEmeraldGreen', source: './models/matcaps/emeraldGreen.png', type: 'texture' },
            { name: 'matcapPurple', source: './models/matcaps/purple.png', type: 'texture' },
            { name: 'matcapBlue', source: './models/matcaps/blue.png', type: 'texture' },
            { name: 'matcapYellow', source: './models/matcaps/yellow.png', type: 'texture' },
            { name: 'matcapMetal', source: './models/matcaps/metal.png', type: 'texture' },
            // { name: 'matcapGold', source: './models/matcaps/gold.png', type: 'texture' },

            { name: 'rocketBase', source: './models/rocket/RoketModeli.glb' },

            // Intro
            { name: 'introStaticBase', source: './models/intro/static/base.glb' },
            { name: 'introStaticCollision', source: './models/intro/static/collision.glb' },
            { name: 'introStaticFloorShadow', source: './models/intro/static/floorShadow.png', type: 'texture' },

            { name: 'introInstructionsLabels', source: './models/intro/instructions/labels.glb' },
            { name: 'introInstructionsArrows', source: './models/intro/instructions/arrows.png', type: 'texture' },
            { name: 'introInstructionsControls', source: './models/intro/instructions/controls.png', type: 'texture' },
            { name: 'introInstructionsOther', source: './models/intro/instructions/other.png', type: 'texture' },

            { name: 'introArrowKeyBase', source: './models/intro/arrowKey/base.glb' },
            { name: 'introArrowKeyCollision', source: './models/intro/arrowKey/collision.glb' },

            { name: 'introCreativeBase', source: './models/intro/creative/base.glb' },
            { name: 'introCreativeCollision', source: './models/intro/creative/collision.glb' },

            { name: 'introDevBase', source: './models/intro/dev/base.glb' },
            { name: 'introDevCollision', source: './models/intro/dev/collision.glb' },

            // Intro
            { name: 'crossroadsStaticBase', source: './models/crossroads/static/base.glb' },
            { name: 'crossroadsStaticCollision', source: './models/crossroads/static/collision.glb' },
            { name: 'crossroadsStaticFloorShadow', source: './models/crossroads/static/floorShadow.png', type: 'texture' },

            // Car default
            { name: 'carDefaultChassis', source: './models/car/togg/toggmodel.glb' },
            { name: 'carDefaultWheel', source: './models/car/default/wheel.glb' },
            { name: 'carDefaultBackLightsBrake', source: './models/car/default/backLightsBrake.glb' },
            { name: 'carDefaultBackLightsReverse', source: './models/car/default/backLightsReverse.glb' },
            { name: 'carDefaultAntena', source: './models/car/default/antena.glb' },
            // { name: 'carDefaultBunnyEarLeft', source: './models/car/default/bunnyEarLeft.glb' },
            // { name: 'carDefaultBunnyEarRight', source: './models/car/default/bunnyEarRight.glb' },

            // Car default
            { name: 'carCyberTruckChassis', source: './models/car/cyberTruck/chassis.glb' },
            { name: 'carCyberTruckWheel', source: './models/car/cyberTruck/wheel.glb' },
            { name: 'carCyberTruckBackLightsBrake', source: './models/car/cyberTruck/backLightsBrake.glb' },
            { name: 'carCyberTruckBackLightsReverse', source: './models/car/cyberTruck/backLightsReverse.glb' },
            { name: 'carCyberTruckAntena', source: './models/car/cyberTruck/antena.glb' },

            // Playground
            { name: 'playgroundStaticBase', source: './models/playground/static/base.glb' },
            { name: 'playgroundStaticCollision', source: './models/playground/static/collision.glb' },
            { name: 'playgroundStaticFloorShadow', source: './models/playground/static/floorShadow.png', type: 'texture' },

            // Brick
            { name: 'brickBase', source: './models/balya/balya.glb' },
            { name: 'brickCollision', source: './models/brick/collision.glb' },

            // Horn
            { name: 'hornBase', source: './models/horn/base.glb' },
            { name: 'hornCollision', source: './models/horn/collision.glb' },

            // Webby trophy
            { name: 'webbyTrophyBase', source: './models/webbyTrophy/base.glb' },
            { name: 'webbyTrophyCollision', source: './models/webbyTrophy/collision.glb' },

            // Areas
            { name: 'areaKeyEnter', source: './models/area/keyEnter.png', type: 'texture' },
            { name: 'areaEnter', source: './models/area/enter.png', type: 'texture' },
            { name: 'areaOpen', source: './models/area/open.png', type: 'texture' },
            { name: 'areaReset', source: './models/area/reset.png', type: 'texture' },
            { name: 'areaQuestionMark', source: './models/area/questionMark.png', type: 'texture' },

            // Tiles
            { name: 'tilesABase', source: './models/tiles/a/base.glb' },
            { name: 'tilesACollision', source: './models/tiles/a/collision.glb' },

            { name: 'tilesBBase', source: './models/tiles/b/base.glb' },
            { name: 'tilesBCollision', source: './models/tiles/b/collision.glb' },

            { name: 'tilesCBase', source: './models/tiles/c/base.glb' },
            { name: 'tilesCCollision', source: './models/tiles/c/collision.glb' },

            { name: 'tilesDBase', source: './models/tiles/d/base.glb' },
            { name: 'tilesDCollision', source: './models/tiles/d/collision.glb' },

            { name: 'tilesEBase', source: './models/tiles/e/base.glb' },
            { name: 'tilesECollision', source: './models/tiles/e/collision.glb' },

            { name: 'Road', source: './models/Road/base.glb' },

            { name: 'Base', source: './models/Base/base.glb' },
            { name: 'ScienceCenter', source: './models/SectionScienceCenter/base.glb' },
            { name: 'GreenScreen', source: './models/SectionGreenScreen/base.glb' },
            { name: 'RenderRoom', source: './models/SectionRenderRoom/base.glb' },
            { name: 'JapanesePark', source: './models/SectionJapanesePark/base.glb' },
            { name: 'Capsule', source: './models/SectionCapsule/base.glb' },
            { name: 'YoungCard', source: './models/SectionYoungCard/base.glb' },
            { name: 'Rocket', source: './models/SectionRocket/base.glb' },
            { name: 'SocialInovation', source: './models/SectionSocialInovation/base.glb' },
            { name: 'RoadSign', source: './models/SectionRoadSign/base.glb' },
            { name: 'TrafficLight', source: './models/SectionTrafficLight/base.glb' },
            { name: 'Lego', source: './models/SectionLego/base.glb' },
            { name: 'SoundRoom', source: './models/SectionSoundRoom/base.glb' },
            { name: 'YoungCenter', source: './models/SectionYoungCenter/base.glb' },

            { name: 'Newton', source:'./models/SectionNewton/base.glb'},

            { name: 'Division', source: './models/SectionDivision/base.glb' },
            { name: 'Alaaddin', source: './models/SectionAlaaddin/base.glb' },
            { name: 'Atmosphere', source: './models/SectionAtmosphere/base.glb' },
            { name: 'Stadium', source: './models/SectionStadium/base.glb' },
            { name: 'Butterfly', source: './models/SectionButterfly/base.glb' },
            { name: 'CoWork', source: './models/SectionCoWork/base.glb' },

            { name: 'Board', source: './models/SectionBillboard/base.glb' },

            // Billboards

            { name: 'Billboard1', source: './models/SectionBillboard/base1.glb' },
            { name: 'Billboard2', source: './models/SectionBillboard/base2.glb' },
            { name: 'Billboard3', source: './models/SectionBillboard/base3.glb' },
            { name: 'Billboard4', source: './models/SectionBillboard/base4.glb' },
            { name: 'Billboard5', source: './models/SectionBillboard/base5.glb' },
            { name: 'Billboard6', source: './models/SectionBillboard/base6.glb' },

            { name: 'Kademe', source:'./models/SectionKademe/base.glb'},
            { name: 'BasketballCourt', source:'./models/SectionBasketballCourt/base.glb'},
            { name: 'Concert', source:'./models/SectionConcert/base.glb'},

            // [GS] Green Screen

            { name: 'UVLake', source: './uv/Lake.webp', type: 'texture' },
            { name: 'UVIceland', source: './uv/Iceland.webp', type: 'texture' },
            { name: 'UVDesert', source: './uv/Desert.webp', type: 'texture' },

            // Football mini game
            { name: 'SectionSoccerGoal', source: './models/SectionSoccer/goal.glb' },
            { name: 'SectionSoccerBall', source: './models/SectionSoccer/ball.glb' },
        ])

        this.loader.on('fileEnd', (_resource, _data) => {
            this.items[_resource.name] = _data

            // Texture
            if (_resource.type === 'texture') {
                const texture = new THREE.Texture(_data)
                texture.needsUpdate = true

                this.items[`${_resource.name}Texture`] = texture
            }

            // Trigger progress
            this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
        })

        this.loader.on('end', () => {
            // Trigger ready
            this.trigger('ready')
        })
    }
}
