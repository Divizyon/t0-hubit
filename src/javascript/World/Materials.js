import * as THREE from 'three'
import FloorShadowMaterial from '../Materials/FloorShadow.js'
import MatcapMaterial from '../Materials/Matcap.js'

export default class Materials
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('materials')
            this.debugFolder.open()
        }

        // Set up
        this.items = {}

        this.setPures()
        this.setShades()
        this.setFloorShadow()
    }

       setPures() {
        // Setup
        this.pures = {}
        this.pures.items = {}

        this.pures.items.uc = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color('#04F404') },
                color2: { value: new THREE.Color('#02752c') },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
            `,
            name: 'pureUc'
        })

        this.pures.items.uc = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color('#04F404') },
                color2: { value: new THREE.Color('#02752c') },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
            `,
            name: '00066F'
        })

        this.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.pures.items.red.name = 'pureRed'

        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.pures.items.white.name = 'pureWhite'

        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })
        this.pures.items.yellow.name = 'pureYellow'

        this.pures.items.golden = new THREE.MeshBasicMaterial({ color: 0xFFD700 })
        this.pures.items.golden.name = 'pureGolden'
        this.pures.items.customcolor1 = new THREE.MeshBasicMaterial({ color: 0x04F404 })

        this.pures.items.customcolor1.name = '04F404'

        this.pures.items.customcolor2 = new THREE.MeshBasicMaterial({ color: 0x303030 })
        this.pures.items.customcolor2.name = '303030'

        this.pures.items.customcolor3 = new THREE.MeshBasicMaterial({ color: 0x6D7367 })
        this.pures.items.customcolor3.name = '6D7367'

        this.pures.items.customcolor4 = new THREE.MeshBasicMaterial({ color: 0xD7DEE2 })
        this.pures.items.customcolor4.name = 'D7DEE2'

        this.pures.items.customcolor5 = new THREE.MeshBasicMaterial({ color: 0xEB3F3F })
        this.pures.items.customcolor5.name = 'EB3F3F'

        this.pures.items.customcolor6 = new THREE.MeshBasicMaterial({ color: 0x4F6A94 })
        this.pures.items.customcolor6.name = '4F6A94'

        this.pures.items.customcolor7 = new THREE.MeshBasicMaterial({ color: 0xEEEEEE })
        this.pures.items.customcolor7.name = 'EEEEEE'

        this.pures.items.customcolor8 = new THREE.MeshBasicMaterial({ color: 0xEB3F3F })
        this.pures.items.customcolor8.name = 'EB3F3F'

        this.pures.items.customcolor9 = new THREE.MeshBasicMaterial({ color: 0x00A29C })
        this.pures.items.customcolor9.name = '00A29C'

        this.pures.items.customcolor10 = new THREE.MeshBasicMaterial({ color: 0x373A3D })
        this.pures.items.customcolor10.name = '373A3D'

        this.pures.items.customcolor11 = new THREE.MeshBasicMaterial({ color: 0xFF0200 })
        this.pures.items.customcolor11.name = 'FF0200'

        this.pures.items.customcolor12 = new THREE.MeshBasicMaterial({ color: 0xFFCFF0 })
        this.pures.items.customcolor12.name = 'FFCFF0'

        this.pures.items.customcolor13 = new THREE.MeshBasicMaterial({ color: 0x717171 })
        this.pures.items.customcolor13.name = '717171'

        this.pures.items.customcolor14 = new THREE.MeshBasicMaterial({ color: 0x132227 })
        this.pures.items.customcolor14.name = '132227'

        this.pures.items.customcolor15 = new THREE.MeshBasicMaterial({ color: 0x01B3E3 })
        this.pures.items.customcolor15.name = '01B3E3'

        this.pures.items.customcolor16 = new THREE.MeshBasicMaterial({ color: 0xDEDEDE })
        this.pures.items.customcolor16.name = 'DEDEDE'

        this.pures.items.customcolor17 = new THREE.MeshBasicMaterial({ color: 0xB1B1B1 })
        this.pures.items.customcolor17.name = 'B1B1B1'

        this.pures.items.customcolor18 = new THREE.MeshBasicMaterial({ color: 0x1E83FF })
        this.pures.items.customcolor18.name = '1E83FF'

        this.pures.items.customcolor19 = new THREE.MeshBasicMaterial({ color: 0xE9E9E9 })
        this.pures.items.customcolor19.name = 'E9E9E9'

        this.pures.items.customcolor20 = new THREE.MeshBasicMaterial({ color: 0x49CECE })
        this.pures.items.customcolor20.name = '49CECE'

        this.pures.items.customcolor21 = new THREE.MeshBasicMaterial({ color: 0x267C6B })
        this.pures.items.customcolor21.name = '267C6B'

        this.pures.items.customcolor22 = new THREE.MeshBasicMaterial({ color: 0x4C98FF })
        this.pures.items.customcolor22.name = '4C98FF'

        this.pures.items.customcolor23 = new THREE.MeshBasicMaterial({ color: 0xCCA173 })
        this.pures.items.customcolor23.name = 'CCA173'

        this.pures.items.customcolor24 = new THREE.MeshBasicMaterial({ color: 0xD1D1D1 })
        this.pures.items.customcolor24.name = 'D1D1D1'

        this.pures.items.customcolor25 = new THREE.MeshBasicMaterial({ color: 0xCAE0FF })
        this.pures.items.customcolor25.name = 'CAE0FF'

        this.pures.items.customcolor26 = new THREE.MeshBasicMaterial({ color: 0xBBBBBB })
        this.pures.items.customcolor26.name = 'BBBBBB'

        this.pures.items.customcolor27 = new THREE.MeshBasicMaterial({ color: 0xEBB54F })
        this.pures.items.customcolor27.name = 'EBB54F'

        this.pures.items.customcolor28 = new THREE.MeshBasicMaterial({ color: 0x27501F })
        this.pures.items.customcolor28.name = '27501F'

        this.pures.items.customcolor29 = new THREE.MeshBasicMaterial({ color: 0x76423B })
        this.pures.items.customcolor29.name = '76423B'

        this.pures.items.customcolor30 = new THREE.MeshBasicMaterial({ color: 0x8CCD70 })
        this.pures.items.customcolor30.name = '8CCD70'

        this.pures.items.customcolor31 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
        this.pures.items.customcolor31.name = 'FFFFFF'

        this.pures.items.customcolor32 = new THREE.MeshBasicMaterial({ color: 0xD99B59 })
        this.pures.items.customcolor32.name = 'D99B59'

        this.pures.items.customcolor33 = new THREE.MeshBasicMaterial({ color: 0xD40000 })
        this.pures.items.customcolor33.name = 'D40000'

        this.pures.items.customcolor34 = new THREE.MeshBasicMaterial({ color: 0xFFFBF3 })
        this.pures.items.customcolor34.name = 'FFFBF3'

        this.pures.items.customcolor35 = new THREE.MeshBasicMaterial({ color: 0x95A1B1 })
        this.pures.items.customcolor35.name = '95A1B1'

        this.pures.items.customcolor36 = new THREE.MeshBasicMaterial({ color: 0xF9EDD7 })
        this.pures.items.customcolor36.name = 'F9EDD7'

        this.pures.items.customcolor37 = new THREE.MeshBasicMaterial({ color: 0xCFCCC7 })
        this.pures.items.customcolor37.name = 'CFCCC7'

        this.pures.items.customcolor38 = new THREE.MeshBasicMaterial({ color: 0xF4F3F3 })
        this.pures.items.customcolor38.name = 'F4F3F3'

        this.pures.items.customcolor39 = new THREE.MeshBasicMaterial({ color: 0x00A300 })
        this.pures.items.customcolor39.name = '00A300'

        this.pures.items.customcolor40 = new THREE.MeshBasicMaterial({ color: 0xFFF3C6 })
        this.pures.items.customcolor40.name = 'FFF3C6'

        this.pures.items.customcolor41 = new THREE.MeshBasicMaterial({ color: 0x132227 })
        this.pures.items.customcolor41.name = '132227'

        this.pures.items.customcolor42 = new THREE.MeshBasicMaterial({ color: 0xFEB34A })
        this.pures.items.customcolor42.name = 'FEB34A'

        this.pures.items.customcolor43 = new THREE.MeshBasicMaterial({ color: 0x404041 })
        this.pures.items.customcolor43.name = '404041'

        this.pures.items.customcolor44 = new THREE.MeshBasicMaterial({ color: 0xBDC0CC })
        this.pures.items.customcolor44.name = 'BDC0CC'

        this.pures.items.customcolor45 = new THREE.MeshBasicMaterial({ color: 0x6F6F6F })
        this.pures.items.customcolor45.name = '6F6F6F'

        this.pures.items.customcolor46 = new THREE.MeshBasicMaterial({ color: 0xBBDAFF })
        this.pures.items.customcolor46.name = 'BBDAFF'

        this.pures.items.customcolor47 = new THREE.MeshBasicMaterial({ color: 0xBDC0CC })
        this.pures.items.customcolor47.name = 'BDC0CC'

        this.pures.items.customcolor48 = new THREE.MeshBasicMaterial({ color: 0x5C5C5C })
        this.pures.items.customcolor48.name = '5C5C5C'

        this.pures.items.customcolor49 = new THREE.MeshBasicMaterial({ color: 0xCD8B61 })
        this.pures.items.customcolor49.name = 'CD8B61'

        this.pures.items.customcolor50 = new THREE.MeshBasicMaterial({ color: 0x71ECEC })
        this.pures.items.customcolor50.name = '71ECEC'
    }

    setShades()
    {
        // Setup
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#d04500'

        this.shades.uniforms = {
            uRevealProgress: 0,
            uIndirectDistanceAmplitude: 1.75,
            uIndirectDistanceStrength: 0.5,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        // White
        this.shades.items.white = new MatcapMaterial()
        this.shades.items.white.name = 'shadeWhite'
        this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.items.white = this.shades.items.white

        // Orange
        this.shades.items.orange = new MatcapMaterial()
        this.shades.items.orange.name = 'shadeOrange'
        this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture
        this.items.orange = this.shades.items.orange

        // Green
        this.shades.items.green = new MatcapMaterial()
        this.shades.items.green.name = ''
        this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture
        this.items.green = this.shades.items.green

        // Brown
        this.shades.items.brown = new MatcapMaterial()
        this.shades.items.brown.name = 'shadeBrown'
        this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture
        this.items.brown = this.shades.items.brown

        // Gray
        this.shades.items.gray = new MatcapMaterial()
        this.shades.items.gray.name = 'shadeGray'
        this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture
        this.items.gray = this.shades.items.gray

        // Beige
        this.shades.items.beige = new MatcapMaterial()
        this.shades.items.beige.name = 'shadeBeige'
        this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
        this.items.beige = this.shades.items.beige

        // Red
        this.shades.items.red = new MatcapMaterial()
        this.shades.items.red.name = 'shadeRed'
        this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.items.red = this.shades.items.red

        // Black
        this.shades.items.black = new MatcapMaterial()
        this.shades.items.black.name = 'shadeBlack'
        this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.items.black = this.shades.items.black

        // Green emerald
        this.shades.items.emeraldGreen = new MatcapMaterial()
        this.shades.items.emeraldGreen.name = 'shadeEmeraldGreen'
        this.shades.items.emeraldGreen.uniforms.matcap.value = this.resources.items.matcapEmeraldGreenTexture
        this.items.emeraldGreen = this.shades.items.emeraldGreen

        // Purple
        this.shades.items.purple = new MatcapMaterial()
        this.shades.items.purple.name = 'shadePurple'
        this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture
        this.items.purple = this.shades.items.purple

        // Blue
        this.shades.items.blue = new MatcapMaterial()
        this.shades.items.blue.name = 'shadeBlue'
        this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
        this.items.blue = this.shades.items.blue

        // Yellow
        this.shades.items.yellow = new MatcapMaterial()
        this.shades.items.yellow.name = 'shadeYellow'
        this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture
        this.items.yellow = this.shades.items.yellow

        // Metal
        this.shades.items.metal = new MatcapMaterial()
        this.shades.items.metal.name = 'shadeMetal'
        this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture
        this.items.metal = this.shades.items.metal

        // HubitBlack
        this.shades.items.hubitBlack = new MatcapMaterial()
        this.shades.items.hubitBlack.name = 'shadeHubitBlack'
        this.shades.items.hubitBlack.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.shades.items.hubitBlack.uniforms.uColor.value = new THREE.Color(0x1E1E1E)
        this.items.hubitBlack = this.shades.items.hubitBlack

        // HubitBlue
        this.shades.items.hubitBlue = new MatcapMaterial()
        this.shades.items.hubitBlue.name = 'shadeHubitBlue'
        this.shades.items.hubitBlue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
        this.shades.items.hubitBlue.uniforms.uColor.value = new THREE.Color(0x5B8CF5)
        this.items.hubitBlue = this.shades.items.hubitBlue

        // HubitDarkBlue
        this.shades.items.hubitDarkBlue = new MatcapMaterial()
        this.shades.items.hubitDarkBlue.name = 'shadeHubitDarkBlue'
        this.shades.items.hubitDarkBlue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
        this.shades.items.hubitDarkBlue.uniforms.uColor.value = new THREE.Color(0x273F85)
        this.items.hubitDarkBlue = this.shades.items.hubitDarkBlue

        // HubitWhite
        this.shades.items.hubitWhite = new MatcapMaterial()
        this.shades.items.hubitWhite.name = 'shadeHubitWhite'
        this.shades.items.hubitWhite.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.shades.items.hubitWhite.uniforms.uColor.value = new THREE.Color(0xF5F5F5)
        this.items.hubitWhite = this.shades.items.hubitWhite

        // HubitRed
        this.shades.items.hubitRed = new MatcapMaterial()
        this.shades.items.hubitRed.name = 'shadeHubitRed'
        this.shades.items.hubitRed.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.shades.items.hubitRed.uniforms.uColor.value = new THREE.Color(0xE53935)
        this.items.hubitRed = this.shades.items.hubitRed

        // HubitGreen
        this.shades.items.hubitGreen = new MatcapMaterial()
        this.shades.items.hubitGreen.name = 'shadeHubitGreen'
        this.shades.items.hubitGreen.uniforms.matcap.value = this.resources.items.matcapGreenTexture
        this.shades.items.hubitGreen.uniforms.uColor.value = new THREE.Color(0x43A047)
        this.items.hubitGreen = this.shades.items.hubitGreen

        // Update materials uniforms
        this.shades.updateMaterials = () =>
        {
            this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

            // Each uniform
            for(const _uniformName in this.shades.uniforms)
            {
                const _uniformValue = this.shades.uniforms[_uniformName]

                // Each material
                for(const _materialKey in this.shades.items)
                {
                    const material = this.shades.items[_materialKey]
                    material.uniforms[_uniformName].value = _uniformValue
                }
            }
        }

        this.shades.updateMaterials()

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('shades')
            folder.open()

            folder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(3).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.addColor(this.shades, 'indirectColor').onChange(this.shades.updateMaterials)
        }
    }

    setFloorShadow()
    {
        this.items.floorShadow = new FloorShadowMaterial()
        this.items.floorShadow.depthWrite = false
        this.items.floorShadow.shadowColor = '#5B8CF5'
        this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
        this.items.floorShadow.uniforms.uAlpha.value = 0

        this.items.floorShadow.updateMaterials = () =>
        {
            this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

            for(const _item of this.objects.items)
            {
                for(const _child of _item.container.children)
                {
                    if(_child.material instanceof THREE.ShaderMaterial)
                    {
                        if(_child.material.uniforms.uShadowColor)
                        {
                            _child.material.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
                        }
                    }
                }
            }
        }

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('floorShadow')
            folder.open()

            folder.addColor(this.items.floorShadow, 'shadowColor').onChange(this.items.floorShadow.updateMaterials)
        }
    }
}
