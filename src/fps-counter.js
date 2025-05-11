class FPSCounter {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
    this.frameID = null;

    // Canvas ve metin öğelerini al
    this.canvas = document.getElementById("fpsCanvas");
    this.fpsText = document.getElementById("fpsCounter");
    this.ctx = this.canvas.getContext("2d");

    // Canvas boyutlarını ayarla
    this.canvas.width = 100;
    this.canvas.height = 50;

    // FPS değerlerini saklamak için dizi
    this.fpsValues = Array(100).fill(0);

    // Frame çizimi ve FPS hesaplama
    this.update = this.update.bind(this);
    this.frameID = requestAnimationFrame(this.update);
  }

  update(timestamp) {
    // Geçerli zaman - timestamp parametresi requestAnimationFrame tarafından sağlanır
    const elapsed = timestamp - this.lastTime;

    // Frame sayısını artır
    this.frames++;

    // Her saniye FPS değerini hesapla ve güncelle
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.lastTime = timestamp;
      this.frames = 0;

      // FPS metnini güncelle
      this.fpsText.textContent = `FPS: ${this.fps}`;

      // FPS değerlerini kaydır ve yeni değeri ekle
      this.fpsValues.shift();
      this.fpsValues.push(this.fps > 0 ? this.fps : 0);

      // Canvas'ı temizle ve grafik çiz
      this.drawGraph();
    }

    this.frameID = requestAnimationFrame(this.update);
  }

  drawGraph() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, width, height);

    // Arka plan
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, width, height);

    // Grafik stilini ayarla
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // FPS değerlerini çiz
    const valueCount = this.fpsValues.length;
    const maxFps = 120; // Maksimum FPS değeri

    for (let i = 0; i < valueCount; i++) {
      const x = (i / valueCount) * width;
      const y = height - (this.fpsValues[i] / maxFps) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Grafiği çiz
    ctx.stroke();
  }

  // İsteğe bağlı: Temizlik fonksiyonu
  destroy() {
    if (this.frameID !== null) {
      cancelAnimationFrame(this.frameID);
    }
  }
}

// DOM yüklendikten sonra FPS sayacını başlat
const fpsCounter = new FPSCounter();

// Sayfa kapatıldığında veya değiştirildiğinde temizlik
window.addEventListener("beforeunload", () => {
  if (fpsCounter) {
    fpsCounter.destroy();
  }
});
// FPS sayacını başlat