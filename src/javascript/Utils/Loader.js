import EventEmitter from './EventEmitter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter
{
    /**
     * Constructor
     */
    constructor()
    {
        super()

        this.setLoaders()

        this.toLoad = 0
        this.loaded = 0
        this.items = {}
    }

    /**
     * Set loaders
     */
    setLoaders()
    {
        this.loaders = {}
        this.loadersArray = []

        // Images
        this.loadersArray.push({
            extensions: ['jpg', 'png', 'webp'],
            action: (_resource) =>
            {
                const image = new Image()

                image.addEventListener('load', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.addEventListener('error', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.src = _resource.source
            }
        })

        // Draco
        this.loaders.dracoLoader = new DRACOLoader()
        this.loaders.dracoLoader.setDecoderPath('./draco/')

        this.loadersArray.push({
            extensions: ['drc'],
            action: (_resource) =>
            {
                this.loaders.dracoLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)

                    DRACOLoader.releaseDecoderModule()
                })
            }
        })

        // GLTF
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)

        this.loadersArray.push({
            extensions: ['glb', 'gltf'],
            action: (_resource) =>
            {
                console.log(`GLB/GLTF model yükleniyor: ${_resource.source}`)
                this.loaders.gltfLoader.load(
                    _resource.source,
                    (_data) => {
                        console.log(`${_resource.name} modeli başarıyla yüklendi:`, _data)
                        this.fileLoadEnd(_resource, _data)
                    },
                    (_progress) => {},
                    (_error) => {
                        console.error(`${_resource.name} modeli yüklenirken hata:`, _error)
                        this.fileLoadEnd(_resource, null)
                    }
                )
            }
        })

        // FBX
        const fbxLoader = new FBXLoader()

        this.loadersArray.push({
            extensions: ['fbx'],
            action: (_resource) =>
            {
                fbxLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })
    }

    /**
     * Load
     */
    load(_resources = [])
    {
        // Counter
        let count = 0
        this.toLoad = _resources.length

        // Loaded check
        const checkLoaded = () => {
            count++
            this.loaded = count
            this.trigger('progress', [count / this.toLoad])

            console.log(`[Loader] ${count}/${this.toLoad} yüklendi`)

            if (count === this.toLoad) {
                console.log(`[Loader] Tüm kaynaklar yüklendi (${this.toLoad}/${this.toLoad})`)
                this.trigger('end')
            }
        }

        // Handler
        const fileLoadEnd = (_resource, _data) => {
            this.trigger('fileEnd', [_resource, _data])
            checkLoaded()
        }

        // Error
        const onError = (_resource, _error) => {
            console.error(`[Loader] ${_resource.source} yüklenirken hata:`, _error)
            this.trigger('error', [_resource, _error])
            fileLoadEnd(_resource, null)
        }

        // Loop through all resources and load them
        if (this.toLoad === 0) {
            console.log('[Loader] Yüklenecek kaynak yok, işlem bitiriliyor')
            setTimeout(() => {
                this.trigger('end')
            }, 1)
            return
        }

        for(const _resource of _resources)
        {
            const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

            if(typeof extensionMatch[1] !== 'undefined')
            {
                const extension = extensionMatch[1]
                const loader = this.loadersArray.find((_loader) => _loader.extensions.find((_extension) => _extension === extension))

                if(loader)
                {
                    loader.action(_resource)
                }
                else
                {
                    console.warn(`Cannot found loader for ${_resource}`)
                }
            }
            else
            {
                console.warn(`Cannot found extension of ${_resource}`)
            }
        }
    }

    /**
     * File load end
     */
    fileLoadEnd(_resource, _data)
    {
        this.loaded++
        this.items[_resource.name] = _data

        this.trigger('fileEnd', [_resource, _data])

        if(this.loaded === this.toLoad)
        {
            this.trigger('end')
        }
    }
}
