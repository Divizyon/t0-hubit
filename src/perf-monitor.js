// Three.js model ve dosya yükü monitörü
class ThreeStatsMonitor {
  constructor() {
    //console.log("Performans monitörü oluşturuluyor...");

    // DOM elementleri
    this.trianglesElement = document.getElementById("perf-triangles");
    this.callsElement = document.getElementById("perf-calls");
    this.geometriesElement = document.getElementById("perf-geometries");
    this.texturesElement = document.getElementById("perf-textures");

    // DOM elemanlari kontrolü
    if (
      !this.trianglesElement ||
      !this.callsElement ||
      !this.geometriesElement ||
      !this.texturesElement
    ) {
      console.warn("Bazı performans gösterge elementleri bulunamadı!");
    }

    // Panel elementini oluştur
    this.createModelLoadPanel();

    this.isActive = true;
    this.updateInterval = 1000; // ms
    this.lastUpdate = performance.now();

    // Model ve dosya yükü izleme
    this.models = new Map(); // {name: {size, triangles, materials, textures, loadTime}}
    this.jsFiles = new Map(); // {name: {size, loadTime}}
    this.totalModelSize = 0;
    this.totalJsSize = 0;

    // Debug modu
    this.debugMode = true;
    //if (this.debugMode) console.log("Performans monitörü debug modu aktif");

    // Application nesnesi hazır olunca başlat
    this.checkForAppAndInit();

    // GLB yüklemelerini izle
    this.monkeyPatchLoaders();
  }

  debug(...args) {
    if (this.debugMode) {
      //console.log("[PerfMonitor]", ...args);
    }
  }

  createModelLoadPanel() {
    try {
      // Mevcut perf-panel elementini bul
      const perfPanel = document.querySelector(".perf-panel");
      if (!perfPanel) {
        console.warn("Performans paneli bulunamadı!");
        return;
      }

      // Model yükü bölümü ekle
      const modelSection = document.createElement("div");
      modelSection.className = "model-load-section";
      modelSection.innerHTML = `
          <h4>Model ve Dosya Yükleri</h4>
          <div id="model-count">Modeller: 0</div>
          <div id="model-size">Toplam Model Boyutu: 0 MB</div>
          <div id="js-count">JS Dosyaları: 0</div>
          <div id="js-size">Toplam JS Boyutu: 0 MB</div>
          <div class="details-toggle">Detaylar <span>▼</span></div>
          <div class="model-details" style="display:none">
            <h5>Model Detayları</h5>
            <ul id="model-list"></ul>
            <h5>JS Dosya Detayları</h5>
            <ul id="js-list"></ul>
          </div>
        `;
      perfPanel.appendChild(modelSection);

      // Detay bölümünü açıp kapama
      const detailsToggle = modelSection.querySelector(".details-toggle");
      const modelDetails = modelSection.querySelector(".model-details");

      this._detailsToggleHandler = () => {
        const isVisible = modelDetails.style.display !== "none";
        modelDetails.style.display = isVisible ? "none" : "block";
        detailsToggle.querySelector("span").textContent = isVisible ? "▼" : "▲";
      };

      detailsToggle.addEventListener("click", this._detailsToggleHandler);

      // Element referanslarını kaydet
      this.modelCountElement = document.getElementById("model-count");
      this.modelSizeElement = document.getElementById("model-size");
      this.jsCountElement = document.getElementById("js-count");
      this.jsSizeElement = document.getElementById("js-size");
      this.modelListElement = document.getElementById("model-list");
      this.jsListElement = document.getElementById("js-list");

      this.debug("Model yükü paneli oluşturuldu");
    } catch (error) {
      console.error("Model yükü paneli oluşturulurken hata:", error);
    }
  }

  checkForAppAndInit() {
    try {
      if (
        window.application &&
        window.application.renderer &&
        window.application.renderer.instance
      ) {
        //this.debug("Application bulundu, performans monitörü başlatılıyor");
        this.init();
      } else {
        // Tekrar dene
        //this.debug("Application bekleniyor...");
        setTimeout(() => this.checkForAppAndInit(), 500);
      }
    } catch (error) {
      console.error("Application kontrolü sırasında hata:", error);
      // Tekrar dene
      setTimeout(() => this.checkForAppAndInit(), 1000);
    }
  }

  init() {
    try {
      this.renderer = window.application.renderer.instance;
      //console.log("Performance monitor başlatıldı");

      // Three.js sürümünü kontrol et ve logla
      if (window.THREE) {
        this.debug(`Three.js sürümü: ${window.THREE.REVISION}`);
      }

      this.update();

      // Mevcut yüklenmiş modelleri kontrol et
      if (window.application.world && window.application.world.models) {
        this.checkExistingModels();
      } else {
        this.debug("Dünya veya modeller bulunamadı");
      }
    } catch (error) {
      console.error("Performans monitörü başlatılırken hata:", error);
    }
  }

  checkExistingModels() {
    try {
      // Eğer dünya içindeki modellerinize erişim için bir yol varsa
      // Burada uygulama yapınıza göre düzenleme gerekebilir
      const models = window.application.world?.models;
      if (!models) {
        this.debug("Mevcut modeller bulunamadı");
        return;
      }

      this.debug(`${Object.keys(models).length} mevcut model bulundu`);

      // Mevcut modelleri tara
      Object.keys(models).forEach((key) => {
        const model = models[key];
        if (!model) return;

        // Model bilgilerini topla
        this.analyzeModel(key, model);
      });

      this.updateModelStats();
    } catch (error) {
      console.error("Mevcut modeller kontrol edilirken hata:", error);
    }
  }

  monkeyPatchLoaders() {
    try {
      // GLTFLoader kontrol ve patching stratejileri:

      // 1. Global THREE objesi üzerinden kontrol
      if (window.THREE && window.THREE.GLTFLoader) {
        this.patchGlobalGLTFLoader();
      }
      // 2. Uygulama loaders kontrolü
      else if (
        window.application &&
        window.application.loaders &&
        window.application.loaders.gltfLoader
      ) {
        this.patchApplicationGLTFLoader();
      }
      // 3. Dynamically wait for the loader
      else {
        //this.debug("GLTFLoader henüz bulunamadı, daha sonra tekrar denenecek");
        setTimeout(() => this.monkeyPatchLoaders(), 1000);
      }

      // JS dosya yüklemelerini izle - Fetch API patch
      this.patchFetchAPI();
    } catch (error) {
      console.error("Loaderlar patching yapılırken hata:", error);
    }
  }

  patchGlobalGLTFLoader() {
    try {
      this.debug("Global THREE.GLTFLoader patching yapılıyor");
      const originalLoad = window.THREE.GLTFLoader.prototype.load;

      window.THREE.GLTFLoader.prototype.load = (
        url,
        onLoad,
        onProgress,
        onError
      ) => {
        const startTime = performance.now();
        this.debug(`Model yükleniyor: ${url}`);

        // Dosya boyutunu almak için bir AJAX isteği yap
        this.getFileSize(url).then((size) => {
          // Modeli izleme listesine ekle (tam analizi callback içinde yapacağız)
          const modelName = url.split("/").pop();
          this.models.set(modelName, {
            url,
            size,
            triangles: 0,
            materials: 0,
            textures: 0,
            loadTime: 0,
          });
        });

        // Orijinal onLoad fonksiyonunu sardır
        const wrappedOnLoad = (gltf) => {
          const loadTime = performance.now() - startTime;
          const modelName = url.split("/").pop();

          this.debug(
            `Model yüklendi: ${modelName} (${loadTime.toFixed(0)} ms)`
          );

          // Model detaylarını topla
          this.analyzeGLTF(modelName, gltf, loadTime);

          // Orijinal callback'i çağır
          if (onLoad) onLoad(gltf);
        };

        // Orijinal load fonksiyonunu çağır
        return originalLoad.call(this, url, wrappedOnLoad, onProgress, onError);
      };

      this.debug("Global THREE.GLTFLoader patching tamamlandı");
    } catch (error) {
      console.error("GLTFLoader patching yapılırken hata:", error);
    }
  }

  patchApplicationGLTFLoader() {
    try {
      this.debug("Application GLTFLoader patching yapılıyor");
      const loader = window.application.loaders.gltfLoader;
      const originalLoad = loader.load;

      loader.load = (url, onLoad, onProgress, onError) => {
        const startTime = performance.now();
        this.debug(`Model yükleniyor: ${url}`);

        // Dosya boyutunu almak için bir AJAX isteği yap
        this.getFileSize(url).then((size) => {
          // Modeli izleme listesine ekle (tam analizi callback içinde yapacağız)
          const modelName = url.split("/").pop();
          this.models.set(modelName, {
            url,
            size,
            triangles: 0,
            materials: 0,
            textures: 0,
            loadTime: 0,
          });
        });

        // Orijinal onLoad fonksiyonunu sardır
        const wrappedOnLoad = (gltf) => {
          const loadTime = performance.now() - startTime;
          const modelName = url.split("/").pop();

          this.debug(
            `Model yüklendi: ${modelName} (${loadTime.toFixed(0)} ms)`
          );

          // Model detaylarını topla
          this.analyzeGLTF(modelName, gltf, loadTime);

          // Orijinal callback'i çağır
          if (onLoad) onLoad(gltf);
        };

        // Orijinal load fonksiyonunu çağır
        return originalLoad.call(
          loader,
          url,
          wrappedOnLoad,
          onProgress,
          onError
        );
      };

      this.debug("Application GLTFLoader patching tamamlandı");
    } catch (error) {
      console.error("Application GLTFLoader patching yapılırken hata:", error);
    }
  }

  patchFetchAPI() {
    try {
      //this.debug("Fetch API patching yapılıyor");

      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const url = input instanceof Request ? input.url : input;

        // Sadece JavaScript dosyalarını ve model dosyalarını izle
        if (
          typeof url === "string" &&
          (url.endsWith(".js") || url.endsWith(".glb") || url.endsWith(".gltf"))
        ) {
          const startTime = performance.now();
          let response;

          try {
            response = await originalFetch(input, init);
          } catch (error) {
            console.error(`Fetch hatası (${url}):`, error);
            throw error; // Re-throw
          }

          const loadTime = performance.now() - startTime;

          // JavaScript dosyası ise
          if (url.endsWith(".js")) {
            try {
              // Dosya boyutunu al
              const clone = response.clone();
              const size = parseInt(clone.headers.get("content-length") || "0");

              // JS dosyasını izleme listesine ekle
              const fileName = url.split("/").pop();
              this.jsFiles.set(fileName, { url, size, loadTime });
              this.totalJsSize += size;

              this.debug(
                `JS dosyası yüklendi: ${fileName} (${this.formatBytes(
                  size
                )}, ${loadTime.toFixed(0)} ms)`
              );

              // UI güncelle
              this.updateJsStats();
            } catch (error) {
              console.error(`JS dosyası işlenirken hata (${url}):`, error);
            }
          }

          return response;
        }

        return originalFetch(input, init);
      };

      // this.debug("Fetch API patching tamamlandı");
    } catch (error) {
      console.error("Fetch API patching yapılırken hata:", error);
    }
  }

  async getFileSize(url) {
    try {
      this.debug(`Dosya boyutu alınıyor: ${url}`);
      const response = await fetch(url, { method: "HEAD" });

      if (!response.ok) {
        this.debug(
          `Dosya boyutu alınamadı: ${url} - Durum kodu: ${response.status}`
        );
        return 0;
      }

      const size = parseInt(response.headers.get("content-length") || "0");
      this.debug(`Dosya boyutu: ${url} - ${this.formatBytes(size)}`);
      return size;
    } catch (error) {
      console.warn(`Dosya boyutu alınamadı: ${url}`, error);
      return 0;
    }
  }

  analyzeGLTF(modelName, gltf, loadTime) {
    try {
      const model = this.models.get(modelName);
      if (!model) {
        this.debug(`Model bulunamadı: ${modelName}`);
        return;
      }

      let triangles = 0;
      const materials = new Set();
      const textures = new Set();

      // Scene üzerinde traverse yaparak geometrileri, materyalleri ve dokuları say
      gltf.scene.traverse((obj) => {
        if (obj.isMesh && obj.geometry) {
          // Üçgen sayısını hesapla
          if (obj.geometry.index) {
            triangles += obj.geometry.index.count / 3;
          } else if (obj.geometry.attributes.position) {
            triangles += obj.geometry.attributes.position.count / 3;
          }

          // Materyal ekle
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => materials.add(mat));
            } else {
              materials.add(obj.material);
            }
          }
        }
      });

      // Kullanılan dokuları say
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && value.isTexture) {
            textures.add(value);
          }
        });
      });

      // Model bilgilerini güncelle
      model.triangles = triangles;
      model.materials = materials.size;
      model.textures = textures.size;
      model.loadTime = loadTime;

      // Toplam model boyutunu güncelle
      this.totalModelSize += model.size;

      this.debug(
        `Model analiz edildi: ${modelName} - ${triangles.toLocaleString()} üçgen, ${
          materials.size
        } materyal, ${textures.size} doku`
      );

      // UI güncelle
      this.updateModelStats();
    } catch (error) {
      console.error(`Model analiz edilirken hata: ${modelName}`, error);
    }
  }

  analyzeModel(modelName, modelObj) {
    try {
      this.debug(`Mevcut model analiz ediliyor: ${modelName}`);

      // Bu fonksiyonu kendi uygulamanızın yapısına göre uyarlamanız gerekebilir
      let triangles = 0;
      let size = 0;
      const materials = new Set();
      const textures = new Set();

      // Obje bir Three.js mesh ya da group ise
      if (modelObj.traverse) {
        modelObj.traverse((obj) => {
          if (obj.isMesh && obj.geometry) {
            // Üçgen sayısını hesapla
            if (obj.geometry.index) {
              triangles += obj.geometry.index.count / 3;
            } else if (obj.geometry.attributes.position) {
              triangles += obj.geometry.attributes.position.count / 3;
            }

            // Geometri boyutunu tahmin et
            size += this.estimateGeometrySize(obj.geometry);

            // Materyal ekle
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => materials.add(mat));
              } else {
                materials.add(obj.material);
              }
            }
          }
        });
      }

      // Kullanılan dokuları say
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && value.isTexture) {
            textures.add(value);
            // Doku boyutunu tahmin et
            size += this.estimateTextureSize(value);
          }
        });
      });

      this.debug(
        `Model analizi tamamlandı: ${modelName} - ${triangles.toLocaleString()} üçgen, ${
          materials.size
        } materyal, ${textures.size} doku, yaklaşık ${this.formatBytes(size)}`
      );

      // Model bilgilerini kaydet
      this.models.set(modelName, {
        size,
        triangles,
        materials: materials.size,
        textures: textures.size,
        loadTime: 0, // Zaten yüklenmiş
      });

      // Toplam model boyutunu güncelle
      this.totalModelSize += size;
    } catch (error) {
      console.error(`Model analizi sırasında hata: ${modelName}`, error);
    }
  }

  estimateGeometrySize(geometry) {
    try {
      let size = 0;

      // Vertex başına byte tahminleri
      const POSITION_SIZE = 12; // 3 float (x, y, z) * 4 bytes
      const NORMAL_SIZE = 12; // 3 float (nx, ny, nz) * 4 bytes
      const UV_SIZE = 8; // 2 float (u, v) * 4 bytes

      // Vertex sayısı
      const vertexCount = geometry.attributes.position
        ? geometry.attributes.position.count
        : 0;

      // Geometri özellikleri için boyut hesapla
      if (geometry.attributes.position) size += vertexCount * POSITION_SIZE;
      if (geometry.attributes.normal) size += vertexCount * NORMAL_SIZE;
      if (geometry.attributes.uv) size += vertexCount * UV_SIZE;

      // İndeks dizisi için boyut ekle
      if (geometry.index) {
        size += geometry.index.count * 2; // 2 bytes per index (16-bit)
      }

      return size;
    } catch (error) {
      console.error("Geometri boyutu hesaplanırken hata:", error);
      return 0;
    }
  }

  estimateTextureSize(texture) {
    try {
      if (!texture.image) return 0;

      const { width, height } = texture.image;
      // 4 bytes per pixel (RGBA)
      return width * height * 4;
    } catch (error) {
      console.error("Doku boyutu hesaplanırken hata:", error);
      return 0;
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  updateModelStats() {
    try {
      if (
        !this.modelCountElement ||
        !this.modelSizeElement ||
        !this.modelListElement
      ) {
        this.debug("Model istatistikleri için UI elementleri bulunamadı");
        return;
      }

      // Ana sayıları güncelle
      this.modelCountElement.textContent = `Modeller: ${this.models.size}`;
      this.modelSizeElement.textContent = `Toplam Model Boyutu: ${this.formatBytes(
        this.totalModelSize
      )}`;

      // Detay listesini güncelle
      this.modelListElement.innerHTML = "";
      this.models.forEach((model, name) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${name}</strong>
            <div>Boyut: ${this.formatBytes(model.size)}</div>
            <div>Üçgenler: ${model.triangles.toLocaleString()}</div>
            <div>Materyaller: ${model.materials}</div>
            <div>Dokular: ${model.textures}</div>
            ${
              model.loadTime
                ? `<div>Yükleme: ${model.loadTime.toFixed(0)} ms</div>`
                : ""
            }
          `;
        this.modelListElement.appendChild(li);
      });
    } catch (error) {
      console.error("Model istatistikleri güncellenirken hata:", error);
    }
  }

  updateJsStats() {
    try {
      if (!this.jsCountElement || !this.jsSizeElement || !this.jsListElement) {
        this.debug("JS istatistikleri için UI elementleri bulunamadı");
        return;
      }

      // Ana sayıları güncelle
      this.jsCountElement.textContent = `JS Dosyaları: ${this.jsFiles.size}`;
      this.jsSizeElement.textContent = `Toplam JS Boyutu: ${this.formatBytes(
        this.totalJsSize
      )}`;

      // Detay listesini güncelle
      this.jsListElement.innerHTML = "";
      this.jsFiles.forEach((file, name) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${name}</strong>
            <div>Boyut: ${this.formatBytes(file.size)}</div>
            <div>Yükleme: ${file.loadTime.toFixed(0)} ms</div>
          `;
        this.jsListElement.appendChild(li);
      });
    } catch (error) {
      console.error("JS istatistikleri güncellenirken hata:", error);
    }
  }

  update() {
    if (!this.isActive) return;

    const now = performance.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      this.lastUpdate = now;
      this.updateStats();
    }

    requestAnimationFrame(() => this.update());
  }

  updateStats() {
    try {
      if (!this.renderer || !this.renderer.info) {
        // this.debug("Renderer info bulunamadı");
        return;
      }

      const info = this.renderer.info;

      // Render bilgileri
      const renderInfo = info.render;
      if (renderInfo) {
        if (this.trianglesElement) {
          this.trianglesElement.textContent = `Üçgenler: ${renderInfo.triangles.toLocaleString()}`;
        }

        if (this.callsElement) {
          this.callsElement.textContent = `Çizimler: ${renderInfo.calls}`;
        }
      }

      // Bellek bilgileri
      const memoryInfo = info.memory;
      if (memoryInfo) {
        if (this.geometriesElement) {
          this.geometriesElement.textContent = `Geometri: ${memoryInfo.geometries}`;
        }

        if (this.texturesElement) {
          this.texturesElement.textContent = `Dokular: ${memoryInfo.textures}`;
        }
      }
    } catch (error) {
      console.error("İstatistikler güncellenirken hata:", error);
    }
  }

  stop() {
    this.isActive = false;

    // Event listener'ları temizle
    try {
      const detailsToggle = document.querySelector(".details-toggle");
      if (detailsToggle && this._detailsToggleHandler) {
        detailsToggle.removeEventListener("click", this._detailsToggleHandler);
      }
    } catch (error) {
      console.error("Temizlik sırasında hata:", error);
    }

    this.debug("Performans monitörü durduruldu");
  }
}

// Monitörü başlat
//console.log("Performans monitörü başlatılıyor...");
const statsMonitor = new ThreeStatsMonitor();

// Sayfa kapatıldığında temizlik
window.addEventListener("beforeunload", () => {
  if (statsMonitor) {
    statsMonitor.stop();
  }
});

// Global erişim için
window.perfMonitor = statsMonitor;

export default statsMonitor;