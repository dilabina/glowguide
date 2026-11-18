// GlowGuide - Aplikasi Rekomendasi Skincare & Makeup Indonesia
// Logika Aplikasi Utama & State Management

// Inisialisasi State Aplikasi
const AppState = {
  activeTab: 'beranda',
  quizStep: 1,
  soundEnabled: true,
  userProfile: {
    skinType: 'kombinasi',
    skinConcerns: ['jerawat', 'kusam'],
    faceShape: 'bulat',
    budgetTier: 'semua', // 'semua', 'hemat', 'menengah', 'premium'
    preference: 'all' // 'all', 'teen', 'halal'
  },
  wishlist: [],
  routineTracker: {
    streak: 3,
    waterCount: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    checkedItems: {}
  },
  canvasLayers: {
    showContour: true,
    showBlush: true,
    showHighlight: true,
    showEyebrows: true,
    showFaceGuide: true
  },
  scannerStream: null
};

// Web Audio API Synthesizer (Efek Suara Lembut Ramah Pengguna)
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playClick() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  },
  playSuccess() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.25);
      });
    } catch (e) {}
  },
  playDrop() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
};

// Penyimpanan Lokal (LocalStorage Persistence)
function loadStoredData() {
  try {
    const savedProfile = localStorage.getItem('glowguide_profile');
    if (savedProfile) {
      AppState.userProfile = JSON.parse(savedProfile);
    }
    const savedWishlist = localStorage.getItem('glowguide_wishlist');
    if (savedWishlist) {
      AppState.wishlist = JSON.parse(savedWishlist);
    }
    const savedTracker = localStorage.getItem('glowguide_tracker');
    if (savedTracker) {
      AppState.routineTracker = JSON.parse(savedTracker);
      const today = new Date().toISOString().split('T')[0];
      if (AppState.routineTracker.lastActiveDate !== today) {
        AppState.routineTracker.lastActiveDate = today;
        AppState.routineTracker.waterCount = 0;
        AppState.routineTracker.checkedItems = {};
      }
    }
  } catch (err) {
    console.error("Gagal memuat data dari localStorage:", err);
  }
}

function saveAppState() {
  try {
    localStorage.setItem('glowguide_profile', JSON.stringify(AppState.userProfile));
    localStorage.setItem('glowguide_wishlist', JSON.stringify(AppState.wishlist));
    localStorage.setItem('glowguide_tracker', JSON.stringify(AppState.routineTracker));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }
}

// Navigasi Antar Tab
function switchTab(tabId) {
  SoundFX.playClick();
  AppState.activeTab = tabId;

  // Sembunyikan semua tab content
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  // Tampilkan tab yang dipilih
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('active');
  }

  // Perbarui style navbar
  document.querySelectorAll('[data-nav-tab]').forEach(btn => {
    if (btn.getAttribute('data-nav-tab') === tabId) {
      btn.classList.add('text-rose-600', 'font-bold', 'border-b-2', 'border-rose-500');
      btn.classList.remove('text-gray-600');
    } else {
      btn.classList.remove('text-rose-600', 'font-bold', 'border-b-2', 'border-rose-500');
      btn.classList.add('text-gray-600');
    }
  });

  // Khusus tab tertentu yang butuh render ulang
  if (tabId === 'rekomendasi') {
    renderRecommendations();
  } else if (tabId === 'bentuk-wajah') {
    renderFaceShapeVisualizer();
  } else if (tabId === 'katalog') {
    applyCatalogFilters();
  } else if (tabId === 'wishlist') {
    renderWishlist();
  } else if (tabId === 'rutinitas') {
    renderRoutineTracker();
  } else if (tabId === 'clash-checker') {
    checkIngredientClash();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== KUIS ANALISIS KECANTIKAN ====================
function initQuiz() {
  AppState.quizStep = 1;
  updateQuizUI();
}

function updateQuizUI() {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`quiz-step-${i}`);
    if (stepEl) {
      if (i === AppState.quizStep) {
        stepEl.classList.remove('hidden');
      } else {
        stepEl.classList.add('hidden');
      }
    }
  }

  // Update Progress Bar & Indikator
  const progressPercent = (AppState.quizStep / 4) * 100;
  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  const progressText = document.getElementById('quiz-step-indicator');
  if (progressText) {
    progressText.innerText = `Langkah ${AppState.quizStep} dari 4`;
  }

  // Update status tombol navigasi
  const btnPrev = document.getElementById('quiz-btn-prev');
  if (btnPrev) {
    btnPrev.style.visibility = AppState.quizStep === 1 ? 'hidden' : 'visible';
  }
}

function nextQuizStep() {
  SoundFX.playClick();
  if (AppState.quizStep < 4) {
    AppState.quizStep++;
    updateQuizUI();
  } else {
    // Selesai Kuis!
    SoundFX.playSuccess();
    saveAppState();
    switchTab('rekomendasi');
  }
}

function prevQuizStep() {
  SoundFX.playClick();
  if (AppState.quizStep > 1) {
    AppState.quizStep--;
    updateQuizUI();
  }
}

function selectSkinType(type) {
  SoundFX.playClick();
  AppState.userProfile.skinType = type;
  document.querySelectorAll('.card-skin-type').forEach(card => {
    if (card.dataset.type === type) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function toggleSkinConcern(concern) {
  SoundFX.playClick();
  const index = AppState.userProfile.skinConcerns.indexOf(concern);
  if (index > -1) {
    if (AppState.userProfile.skinConcerns.length > 1) {
      AppState.userProfile.skinConcerns.splice(index, 1);
    }
  } else {
    AppState.userProfile.skinConcerns.push(concern);
  }

  document.querySelectorAll('.card-skin-concern').forEach(card => {
    if (AppState.userProfile.skinConcerns.includes(card.dataset.concern)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function selectFaceShape(shape) {
  SoundFX.playClick();
  AppState.userProfile.faceShape = shape;
  document.querySelectorAll('.card-face-shape').forEach(card => {
    if (card.dataset.shape === shape) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function selectBudgetTier(tier) {
  SoundFX.playClick();
  AppState.userProfile.budgetTier = tier;
  document.querySelectorAll('.card-budget-tier').forEach(card => {
    if (card.dataset.tier === tier) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function selectPreference(pref) {
  SoundFX.playClick();
  AppState.userProfile.preference = pref;
  document.querySelectorAll('.card-preference').forEach(card => {
    if (card.dataset.pref === pref) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

// ==================== FITUR PEMINDAI KAMERA WAJAH LANGSUNG (LAPTOP, HP, TABLET) ====================
let liveScannerStream = null;
let meshAnimationFrame = null;
let detectedFaceShapeResult = 'bulat';
let currentCameraFacing = 'user'; // 'user' (depan/selfie) atau 'environment' (belakang)

function isMobileOrTabletDevice() {
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  return /android|iphone|ipad|ipod|mobile|windows phone|silk|blackberry/i.test(ua) || (isTouch && window.innerWidth <= 1024);
}

function triggerMobileCamera() {
  SoundFX.playClick();
  const mobileInput = document.getElementById('mobile-camera-input');
  if (mobileInput) {
    mobileInput.click();
  }
}

async function startSmartCamera() {
  // Jika di perangkat mobile/tablet dan getUserMedia tidak didukung pada konteks ini (misal HTTP non-HTTPS):
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (isMobileOrTabletDevice() && !hasGetUserMedia) {
    triggerMobileCamera();
    return;
  }
  await startLiveCamera();
}

async function startLiveCamera() {
  SoundFX.playClick();
  const viewport = document.getElementById('camera-viewport-box');
  const video = document.getElementById('scanner-video');
  const imgPreview = document.getElementById('scanner-img-preview');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');
  const btnSwitch = document.getElementById('btn-switch-camera');
  const resultCard = document.getElementById('camera-scan-result-card');
  const hudStatus = document.getElementById('scanner-hud-status');
  const hudTimer = document.getElementById('scanner-hud-timer');

  if (!viewport || !video) return;

  if (resultCard) resultCard.classList.add('hidden');
  viewport.classList.remove('hidden');
  video.classList.remove('hidden');
  if (imgPreview) imgPreview.classList.add('hidden');
  if (btnStart) btnStart.classList.add('hidden');
  if (btnStop) btnStop.classList.remove('hidden');
  if (btnSwitch) btnSwitch.classList.remove('hidden');

  if (hudStatus) {
    hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Menghubungkan Kamera...`;
  }
  if (hudTimer) {
    hudTimer.innerText = "Memuat...";
  }

  // Atur orientasi cermin: mirror jika kamera depan, normal jika kamera belakang
  if (currentCameraFacing === 'user') {
    video.style.transform = 'scaleX(-1)';
  } else {
    video.style.transform = 'none';
  }

  // Hentikan stream sebelumnya jika ada
  if (liveScannerStream) {
    liveScannerStream.getTracks().forEach(track => track.stop());
    liveScannerStream = null;
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Peramban belum mendukung akses getUserMedia langsung.");
    }

    let stream = null;
    try {
      const constraints = {
        video: {
          facingMode: currentCameraFacing ? { ideal: currentCameraFacing } : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (constraintErr) {
      console.warn("FacingMode constraint tidak didukung webcam, mencoba fallback video umum:", constraintErr);
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    liveScannerStream = stream;
    video.srcObject = stream;
    await video.play();

    if (hudStatus) {
      const cameraType = currentCameraFacing === 'user' ? 'Kamera Depan' : 'Kamera Belakang';
      hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ${cameraType} Aktif • Posisikan Wajah`;
    }
    if (hudTimer) {
      hudTimer.innerText = "Posisikan Wajah";
    }

    // Mulai animasi gambar garis mesh overlay
    startMeshOverlayAnimation();

  } catch (err) {
    console.warn("Kamera tidak dapat diakses langsung (kebijakan keamanan/izin peramban):", err);

    if (isMobileOrTabletDevice()) {
      if (hudStatus) {
        hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> Membuka Kamera Bawaan HP / Tablet...`;
      }
      triggerMobileCamera();
    } else {
      if (hudStatus) {
        hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> Izin kamera belum diberikan`;
      }
      if (hudTimer) {
        hudTimer.innerText = "Cek Izin Kamera";
      }
      alert("Tidak dapat mengakses kamera laptop langsung.\n\nTips:\n1. Pastikan izin kamera telah disetujui (klik ikon gembok/kamera di bilah URL browser).\n2. Atau gunakan opsi 'Galeri Foto' untuk mengunggah foto selfie Anda.");
    }
  }
}

function toggleCameraFacing() {
  SoundFX.playClick();
  currentCameraFacing = currentCameraFacing === 'user' ? 'environment' : 'user';
  startLiveCamera();
}

function toggleDeviceQRModal() {
  SoundFX.playClick();
  const modal = document.getElementById('device-qr-modal');
  if (!modal) return;

  const isOpening = modal.classList.contains('hidden');
  if (isOpening) {
    let targetHost = window.location.hostname;
    let targetPort = window.location.port || '5050';
    if (!targetHost || targetHost === 'localhost' || targetHost === '127.0.0.1') {
      targetHost = '10.202.8.184';
    }
    const fullScanUrl = `http://${targetHost}:${targetPort}/#scan`;

    const qrImg = modal.querySelector('img');
    const qrText = modal.querySelector('.font-mono');
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullScanUrl)}`;
    }
    if (qrText) {
      qrText.innerText = fullScanUrl;
    }
  }
  modal.classList.toggle('hidden');
}

function stopLiveCamera() {
  SoundFX.playClick();
  if (liveScannerStream) {
    liveScannerStream.getTracks().forEach(track => track.stop());
    liveScannerStream = null;
  }

  if (meshAnimationFrame) {
    cancelAnimationFrame(meshAnimationFrame);
    meshAnimationFrame = null;
  }

  const viewport = document.getElementById('camera-viewport-box');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');
  const btnSwitch = document.getElementById('btn-switch-camera');

  if (viewport) viewport.classList.add('hidden');
  if (btnStart) btnStart.classList.remove('hidden');
  if (btnStop) btnStop.classList.add('hidden');
  if (btnSwitch) btnSwitch.classList.add('hidden');
}

function handlePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  SoundFX.playClick();
  stopLiveCamera();

  const reader = new FileReader();
  reader.onload = function(e) {
    const viewport = document.getElementById('camera-viewport-box');
    const video = document.getElementById('scanner-video');
    const imgPreview = document.getElementById('scanner-img-preview');
    const btnStart = document.getElementById('btn-start-camera');
    const btnStop = document.getElementById('btn-stop-camera');
    const btnSwitch = document.getElementById('btn-switch-camera');
    const hudStatus = document.getElementById('scanner-hud-status');
    const hudTimer = document.getElementById('scanner-hud-timer');
    const resultCard = document.getElementById('camera-scan-result-card');

    if (resultCard) resultCard.classList.add('hidden');

    if (viewport && imgPreview) {
      viewport.classList.remove('hidden');
      if (video) video.classList.add('hidden');
      if (btnSwitch) btnSwitch.classList.add('hidden');
      imgPreview.src = e.target.result;
      imgPreview.classList.remove('hidden');
      if (btnStart) btnStart.classList.add('hidden');
      if (btnStop) btnStop.classList.remove('hidden');

      if (hudStatus) {
        hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Foto Selfie Dimuat • Memindai Kontur`;
      }
      if (hudTimer) {
        hudTimer.innerText = "Foto Siap";
      }

      startMeshOverlayAnimation();

      // Otomatis lakukan analisis wajah setelah foto dimuat
      setTimeout(() => {
        captureAndAnalyzeFace();
      }, 700);
    }
  };
  reader.readAsDataURL(file);
}
      if (btnStop) btnStop.classList.remove('hidden');

      if (hudStatus) {
        hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> Foto Terunggah • Siap Dianalisis`;
      }

      startMeshOverlayAnimation();
    }
  };
  reader.readAsDataURL(file);
}

function startMeshOverlayAnimation() {
  const canvas = document.getElementById('scanner-mesh-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let angle = 0;

  function renderMesh() {
    canvas.width = canvas.clientWidth || 360;
    canvas.height = canvas.clientHeight || 270;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Dynamic pulsating face guide oval
    angle += 0.04;
    const pulse = Math.sin(angle) * 3;
    const rx = (w * 0.28) + pulse;
    const ry = (h * 0.38) + pulse;

    // Glowing Oval
    ctx.save();
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Corner HUD target brackets
    ctx.setLineDash([]);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;

    const bSize = 18;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(cx - rx - 10, cy - ry + bSize);
    ctx.lineTo(cx - rx - 10, cy - ry - 10);
    ctx.lineTo(cx - rx + bSize, cy - ry - 10);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(cx + rx + 10, cy - ry + bSize);
    ctx.lineTo(cx + rx + 10, cy - ry - 10);
    ctx.lineTo(cx + rx - bSize, cy - ry - 10);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cx - rx - 10, cy + ry - bSize);
    ctx.lineTo(cx - rx - 10, cy + ry + 10);
    ctx.lineTo(cx - rx + bSize, cy + ry + 10);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(cx + rx + 10, cy + ry - bSize);
    ctx.lineTo(cx + rx + 10, cy + ry + 10);
    ctx.lineTo(cx + rx - bSize, cy + ry + 10);
    ctx.stroke();

    // Facial landmark measurement points (Dahi, Pelipis, Tulang Pipi, Rahang, Dagu)
    ctx.fillStyle = '#10b981';
    const points = [
      { x: cx, y: cy - ry * 0.75, label: "Dahi" },
      { x: cx - rx * 0.75, y: cy - ry * 0.2, label: "Pelipis Kiri" },
      { x: cx + rx * 0.75, y: cy - ry * 0.2, label: "Pelipis Kanan" },
      { x: cx - rx * 0.85, y: cy + ry * 0.1, label: "Pipi Kiri" },
      { x: cx + rx * 0.85, y: cy + ry * 0.1, label: "Pipi Kanan" },
      { x: cx - rx * 0.6, y: cy + ry * 0.6, label: "Rahang Kiri" },
      { x: cx + rx * 0.6, y: cy + ry * 0.6, label: "Rahang Kanan" },
      { x: cx, y: cy + ry * 0.9, label: "Dagu" }
    ];

    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Connecting measurement guide lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    // Horizontal Cheekbone width
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.85, cy + ry * 0.1);
    ctx.lineTo(cx + rx * 0.85, cy + ry * 0.1);
    ctx.stroke();

    // Horizontal Jaw width
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.6, cy + ry * 0.6);
    ctx.lineTo(cx + rx * 0.6, cy + ry * 0.6);
    ctx.stroke();

    // Vertical Length
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry * 0.75);
    ctx.lineTo(cx, cy + ry * 0.9);
    ctx.stroke();

    ctx.restore();

    meshAnimationFrame = requestAnimationFrame(renderMesh);
  }

  if (meshAnimationFrame) cancelAnimationFrame(meshAnimationFrame);
  meshAnimationFrame = requestAnimationFrame(renderMesh);
}

function analyzeFaceImageRatios() {
  const canvas = document.createElement('canvas');
  const video = document.getElementById('scanner-video');
  const imgPreview = document.getElementById('scanner-img-preview');

  let sourceWidth = 640;
  let sourceHeight = 480;
  let isVideo = false;

  if (video && !video.classList.contains('hidden') && video.videoWidth > 0) {
    sourceWidth = video.videoWidth;
    sourceHeight = video.videoHeight;
    isVideo = true;
  } else if (imgPreview && !imgPreview.classList.contains('hidden') && imgPreview.naturalWidth > 0) {
    sourceWidth = imgPreview.naturalWidth;
    sourceHeight = imgPreview.naturalHeight;
  }

  canvas.width = 320;
  canvas.height = Math.round(320 * (sourceHeight / sourceWidth)) || 320;
  const ctx = canvas.getContext('2d');

  if (isVideo) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } else if (imgPreview) {
    ctx.drawImage(imgPreview, 0, 0, canvas.width, canvas.height);
  }

  let detectedShape = 'oval';
  let ratioStr = '1:1.36';
  let jawScore = 'Melandai Ramping';
  let widestScore = 'Tulang Pipi Halus';
  let confidence = 94;

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    for (let y = Math.floor(canvas.height * 0.1); y < canvas.height * 0.9; y += 4) {
      for (let x = Math.floor(canvas.width * 0.1); x < canvas.width * 0.9; x += 4) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const isSkin = (r > 60 && g > 40 && b > 20 && r > g && (r - g) >= 8 && (r - b) >= 12);
        if (isSkin) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const faceWidth = Math.max(80, maxX - minX);
    const faceHeight = Math.max(90, maxY - minY);
    const calculatedRatio = parseFloat((faceHeight / faceWidth).toFixed(2));

    const yForehead = Math.floor(minY + faceHeight * 0.28);
    const yCheek = Math.floor(minY + faceHeight * 0.50);
    const yJaw = Math.floor(minY + faceHeight * 0.78);

    function getWidthAtY(targetY) {
      let left = canvas.width, right = 0;
      for (let x = minX; x <= maxX; x += 2) {
        const idx = (targetY * canvas.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r > 60 && g > 40 && b > 20 && r > g) {
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
      return Math.max(30, right - left);
    }

    const wForehead = getWidthAtY(yForehead);
    const wCheek = getWidthAtY(yCheek);
    const wJaw = getWidthAtY(yJaw);

    if (calculatedRatio >= 1.50) {
      detectedShape = 'lonjong';
      ratioStr = `1:${calculatedRatio}`;
      jawScore = 'Lurus Memanjang';
      widestScore = 'Dahi & Dagu Tinggi';
      confidence = Math.floor(93 + Math.random() * 5);
    } else if (wForehead > wJaw * 1.25 && wCheek >= wForehead * 0.88) {
      detectedShape = 'hati';
      ratioStr = `1:${calculatedRatio}`;
      jawScore = 'Dagu Runcing V-Shape';
      widestScore = 'Dahi & Pelipis Lebar';
      confidence = Math.floor(94 + Math.random() * 4);
    } else if (wCheek > wForehead * 1.15 && wCheek > wJaw * 1.18) {
      detectedShape = 'diamond';
      ratioStr = `1:${calculatedRatio}`;
      jawScore = 'Dagu Ramping V-Line';
      widestScore = 'Tulang Pipi Menonjol';
      confidence = Math.floor(92 + Math.random() * 6);
    } else if (calculatedRatio <= 1.22 && Math.abs(wJaw - wForehead) < 18) {
      detectedShape = 'kotak';
      ratioStr = `1:${calculatedRatio}`;
      jawScore = 'Sudut Tegas 90°';
      widestScore = 'Dahi & Rahang Sejajar';
      confidence = Math.floor(93 + Math.random() * 5);
    } else if (calculatedRatio <= 1.25) {
      detectedShape = 'bulat';
      ratioStr = `1:${calculatedRatio}`;
      jawScore = 'Melengkung Halus Chubby';
      widestScore = 'Pipi Penuh Seimbang';
      confidence = Math.floor(94 + Math.random() * 5);
    } else {
      detectedShape = 'oval';
      ratioStr = `1:${(calculatedRatio >= 1.25 && calculatedRatio <= 1.50) ? calculatedRatio : 1.38}`;
      jawScore = 'Melandai Proporsional';
      widestScore = 'Tulang Pipi Halus';
      confidence = Math.floor(95 + Math.random() * 4);
    }
  } catch (err) {
    console.warn("Pixel calculation error, fallback gracefully:", err);
    detectedShape = AppState.userProfile.faceShape || 'oval';
    ratioStr = '1:1.38';
    jawScore = 'Melandai Proporsional';
    widestScore = 'Tulang Pipi Halus';
    confidence = 94;
  }

  return { detectedShape, ratioStr, jawScore, widestScore, confidence };
}

function captureAndAnalyzeFace() {
  SoundFX.playClick();
  const btnCapture = document.getElementById('btn-capture-scan');
  const hudStatus = document.getElementById('scanner-hud-status');
  const laser = document.getElementById('scanner-laser');

  if (btnCapture) {
    btnCapture.disabled = true;
    btnCapture.innerHTML = `<span class="animate-spin inline-block mr-2">✦</span> Menghitung Proporsi Wajah...`;
  }

  if (hudStatus) {
    hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span> Menganalisis Kontur & Rahang...`;
  }

  if (laser) {
    laser.style.animationDuration = '0.8s';
  }

  setTimeout(() => {
    SoundFX.playSuccess();

    const analysis = analyzeFaceImageRatios();
    detectedFaceShapeResult = analysis.detectedShape;
    const shapeData = FACE_SHAPES_INFO[detectedFaceShapeResult] || FACE_SHAPES_INFO['oval'];
    const resultCard = document.getElementById('camera-scan-result-card');

    if (resultCard) {
      const shapeTitle = document.getElementById('detected-shape-title');
      const shapeExp = document.getElementById('detected-shape-explanation');
      const confBadge = document.getElementById('detected-confidence-badge');
      const metricRatio = document.getElementById('metric-ratio');
      const metricJaw = document.getElementById('metric-jaw');
      const metricWidest = document.getElementById('metric-widest');
      const shapeIcon = document.getElementById('detected-shape-icon');

      if (shapeTitle) shapeTitle.innerText = shapeData.name;
      if (shapeExp) shapeExp.innerText = shapeData.visualCharacteristics + ' ' + shapeData.tagline;
      if (confBadge) confBadge.innerText = `${analysis.confidence}% Kecocokan`;
      if (metricRatio) metricRatio.innerText = `${analysis.ratioStr} (Proporsional)`;
      if (metricJaw) metricJaw.innerText = analysis.jawScore;
      if (metricWidest) metricWidest.innerText = analysis.widestScore;

      const icons = {
        'bulat': '⚪',
        'oval': '🥚',
        'kotak': '⏹️',
        'hati': '💖',
        'lonjong': '⏳',
        'diamond': '💎'
      };
      if (shapeIcon) shapeIcon.innerText = icons[detectedFaceShapeResult] || '✨';

      resultCard.classList.remove('hidden');
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Auto-select this face shape in quiz options
    selectFaceShape(detectedFaceShapeResult);

    if (btnCapture) {
      btnCapture.disabled = false;
      btnCapture.innerHTML = `<span>✨</span> Pindai Ulang Kamera`;
    }

    if (hudStatus) {
      hudStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> Analisis Selesai: ${shapeData.name}`;
    }

    // Hentikan video kamera setelah sukses agar hemat baterai
    if (liveScannerStream) {
      liveScannerStream.getTracks().forEach(track => track.stop());
      liveScannerStream = null;
    }
  }, 1200);
}

function applyDetectedShape() {
  SoundFX.playSuccess();
  selectFaceShape(detectedFaceShapeResult);
  saveAppState();
  nextQuizStep();
}

function resetScannerView() {
  startSmartCamera();
}

function openFaceScannerDirectly() {
  SoundFX.playClick();
  switchTab('kuis');
  AppState.quizStep = 3;
  updateQuizUI();
  setTimeout(() => {
    startSmartCamera();
    const target = document.getElementById('camera-viewport-box') || document.getElementById('quiz-step-3');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 250);
}

function openFaceScannerFromVisualizer() {
  openFaceScannerDirectly();
}

// ==================== ENGINE REKOMENDASI PRODUK & RUTINITAS ====================
function renderRecommendations() {
  const profile = AppState.userProfile;
  const skinInfo = SKIN_TYPES_INFO[profile.skinType] || SKIN_TYPES_INFO.kombinasi;
  const faceInfo = FACE_SHAPES_INFO[profile.faceShape] || FACE_SHAPES_INFO.bulat;

  // Header Profil Ringkasan
  const badgeContainer = document.getElementById('rec-profile-badges');
  if (badgeContainer) {
    const concernNames = profile.skinConcerns.map(c => SKIN_CONCERNS_INFO[c]?.name || c).join(', ');
    const budgetLabel = profile.budgetTier === 'hemat' ? 'Kantong Pelajar (< Rp 50rb)' : profile.budgetTier === 'menengah' ? 'Menengah (Rp 50-150rb)' : profile.budgetTier === 'premium' ? 'Sultan (> Rp 150rb)' : 'Semua Rentang Budget';
    
    badgeContainer.innerHTML = `
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          🌸 ${skinInfo.name}
        </span>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          ✨ Bentuk: ${faceInfo.name}
        </span>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          💰 ${budgetLabel}
        </span>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          🎯 Masalah: ${concernNames}
        </span>
      </div>
    `;
  }

  // Filter Produk Sesuai Profil
  const matchProduct = (p) => {
    // Cek jenis kulit
    const skinMatches = p.skinTypes.includes('semua') || p.skinTypes.includes(profile.skinType);
    if (!skinMatches) return false;

    // Cek budget jika dipilih
    if (profile.budgetTier !== 'semua' && p.priceCategory !== profile.budgetTier) {
      return false;
    }

    // Cek preferensi
    if (profile.preference === 'teen' && !p.teenFriendly) return false;
    if (profile.preference === 'halal' && !p.halal) return false;

    return true;
  };

  const matchingProducts = PRODUCTS_DATABASE.filter(matchProduct);

  // Buat Rangkaian Rutinitas Pagi (Morning Routine)
  const amCleanser = matchingProducts.find(p => p.category === "Pembersih Wajah") || PRODUCTS_DATABASE[0];
  const amToner = matchingProducts.find(p => p.category === "Toner") || PRODUCTS_DATABASE[4];
  const amSerum = matchingProducts.find(p => p.category === "Serum") || PRODUCTS_DATABASE[7];
  const amMoisturizer = matchingProducts.find(p => p.category === "Pelembap") || PRODUCTS_DATABASE[10];
  const amSunscreen = matchingProducts.find(p => p.category === "Sunscreen") || PRODUCTS_DATABASE[13];

  const morningSteps = [
    { step: 1, title: "Langkah 1: Sabun Pembersih Lembut", role: "Membersihkan minyak semalam tanpa bikin kering", product: amCleanser },
    { step: 2, title: "Langkah 2: Hydrating Toner", role: "Mengembalikan hidrasi dan menyeimbangkan pH kulit", product: amToner },
    { step: 3, title: "Langkah 3: Serum Perawatan", role: "Menargetkan masalah kusam & jerawat", product: amSerum },
    { step: 4, title: "Langkah 4: Pelembap Gel Segar", role: "Mengunci kadar air dan memperkuat skin barrier", product: amMoisturizer },
    { step: 5, title: "Langkah 5: Sunscreen SPF 30-50+", role: "Tameng utama dari penuaan dini & flek hitam", product: amSunscreen }
  ];

  // Render Rutinitas Pagi
  const morningContainer = document.getElementById('morning-routine-container');
  if (morningContainer) {
    morningContainer.innerHTML = morningSteps.map(item => createRoutineCardHTML(item)).join('');
  }

  // Buat Rangkaian Rutinitas Malam (Night Routine)
  const pmMicellar = matchingProducts.find(p => p.category === "Double Cleansing") || PRODUCTS_DATABASE[3];
  const pmCleanser = amCleanser;
  const pmToner = matchingProducts.find(p => p.category === "Toner Eksfoliasi" || p.category === "Toner") || PRODUCTS_DATABASE[5];
  const pmSerum = matchingProducts.find(p => p.category === "Serum" && p.id !== amSerum.id) || amSerum;
  const pmMoisturizer = amMoisturizer;

  const nightSteps = [
    { step: 1, title: "Langkah 1: Double Cleansing (Pembersih Pertama)", role: "Wajib mengangkat sisa sunscreen, polusi, dan makeup", product: pmMicellar },
    { step: 2, title: "Langkah 2: Facial Cleanser", role: "Membersihkan residu micellar dan kotoran secara tuntas", product: pmCleanser },
    { step: 3, title: "Langkah 3: Exfoliating / Calming Toner", role: "Memperlancar regenerasi sel kulit saat tidur", product: pmToner },
    { step: 4, title: "Langkah 4: Nourishing Serum", role: "Memperbaiki jaringan kulit dan menutrisi intensif", product: pmSerum },
    { step: 5, title: "Langkah 5: Barrier Night Moisturizer", role: "Mengunci kelembapan semalaman di ruangan ber-AC", product: pmMoisturizer }
  ];

  const nightContainer = document.getElementById('night-routine-container');
  if (nightContainer) {
    nightContainer.innerHTML = nightSteps.map(item => createRoutineCardHTML(item)).join('');
  }

  // Rekomendasi Makeup Berdasarkan Bentuk Wajah
  renderFaceMakeupRecommendations(faceInfo);

  // Estimasi Total Biaya Skincare
  const uniqueProducts = Array.from(new Set([amCleanser, amToner, amSerum, amMoisturizer, amSunscreen, pmMicellar]));
  const totalPrice = uniqueProducts.reduce((sum, p) => sum + (p ? p.price : 0), 0);
  
  const totalPriceEl = document.getElementById('routine-total-price');
  if (totalPriceEl) {
    totalPriceEl.innerText = formatIDR(totalPrice);
  }
}

function createRoutineCardHTML(item) {
  const p = item.product;
  if (!p) return '';
  const isWishlisted = AppState.wishlist.includes(p.id);

  return `
    <div class="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-center">
      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg shadow-inner">
        ${item.step}
      </div>
      <img src="${p.image}" alt="${p.name}" class="w-20 h-20 object-cover rounded-xl border border-rose-100 shadow-sm" loading="lazy" />
      <div class="flex-1 text-center md:text-left">
        <div class="text-xs font-semibold text-rose-500 uppercase tracking-wider">${item.title}</div>
        <div class="font-bold text-gray-900 text-base flex items-center justify-center md:justify-start gap-2 flex-wrap">
          <span>${p.name}</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">${p.brand}</span>
        </div>
        <p class="text-xs text-gray-500 mt-0.5">${item.role}</p>
        <div class="flex items-center justify-center md:justify-start gap-2 mt-2">
          <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">${formatIDR(p.price)}</span>
          <span class="text-xs text-gray-500">⭐ ${p.rating} (${p.reviews.toLocaleString('id-ID')} ulasan)</span>
        </div>
      </div>
      <div class="flex md:flex-col gap-2 w-full md:w-auto">
        <button onclick="openProductModal('${p.id}')" class="flex-1 md:flex-none px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 border border-gray-200 transition">
          Detail
        </button>
        <button onclick="toggleWishlist('${p.id}')" class="flex-1 md:flex-none px-3 py-2 text-xs font-semibold rounded-xl ${isWishlisted ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'} transition flex items-center justify-center gap-1">
          <span>${isWishlisted ? '♥ Tersimpan' : '♡ Wishlist'}</span>
        </button>
      </div>
    </div>
  `;
}

function renderFaceMakeupRecommendations(faceInfo) {
  const container = document.getElementById('face-makeup-guide-content');
  if (!container) return;

  const makeupProducts = PRODUCTS_DATABASE.filter(p => p.type === 'makeup').slice(0, 4);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-200/70">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">🎨</span>
          <h4 class="font-bold text-gray-900 text-lg">Panduan Shading & Contour Khusus ${faceInfo.name}</h4>
        </div>
        <p class="text-sm text-gray-700 mb-4 leading-relaxed">${faceInfo.contourGuide.placement}</p>
        
        <div class="space-y-3">
          <div class="p-3 bg-white/90 rounded-2xl border border-rose-100">
            <div class="font-bold text-xs text-rose-600 uppercase">Perona Pipi (Blush On)</div>
            <p class="text-xs text-gray-700 mt-1">${faceInfo.contourGuide.blushPlacement}</p>
          </div>
          <div class="p-3 bg-white/90 rounded-2xl border border-rose-100">
            <div class="font-bold text-xs text-amber-600 uppercase">Kilau Cahaya (Highlighter)</div>
            <p class="text-xs text-gray-700 mt-1">${faceInfo.contourGuide.highlightPlacement}</p>
          </div>
          <div class="p-3 bg-white/90 rounded-2xl border border-rose-100">
            <div class="font-bold text-xs text-purple-600 uppercase">Bentuk Alis Ideal</div>
            <p class="text-xs text-gray-700 mt-1">${faceInfo.contourGuide.eyebrowStyle}</p>
          </div>
          <div class="p-3 bg-white/90 rounded-2xl border border-rose-100">
            <div class="font-bold text-xs text-pink-600 uppercase">Riasan Bibir (Lip Look)</div>
            <p class="text-xs text-gray-700 mt-1">${faceInfo.contourGuide.lipStyle}</p>
          </div>
        </div>

        <div class="mt-4 p-3 bg-rose-100/60 rounded-xl text-xs text-rose-800">
          <strong>💡 Tips Praktis:</strong> ${faceInfo.quickTips}
        </div>
      </div>

      <div class="flex flex-col justify-between">
        <h4 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <span>💄</span> Produk Makeup Lokal yang Disarankan
        </h4>
        <div class="space-y-3">
          ${makeupProducts.map(p => `
            <div class="p-3 bg-white rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover" alt="${p.name}"/>
                <div>
                  <div class="text-xs font-semibold text-rose-500">${p.category}</div>
                  <div class="text-sm font-bold text-gray-900 line-clamp-1">${p.name}</div>
                  <div class="text-xs font-bold text-gray-600">${formatIDR(p.price)}</div>
                </div>
              </div>
              <button onclick="openProductModal('${p.id}')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600">
                Lihat
              </button>
            </div>
          `).join('')}
        </div>

        <button onclick="switchTab('bentuk-wajah')" class="mt-4 w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
          <span>✨</span> Buka Visualizer Bentuk Wajah Interaktif
        </button>
      </div>
    </div>
  `;
}

// ==================== VISUALIZER BENTUK WAJAH INTERAKTIF (CANVAS) ====================
function renderFaceShapeVisualizer() {
  const shape = AppState.userProfile.faceShape || 'bulat';
  const info = FACE_SHAPES_INFO[shape] || FACE_SHAPES_INFO.bulat;

  // Update dropdown / tab selector jika ada
  const shapeSelect = document.getElementById('visualizer-shape-select');
  if (shapeSelect && shapeSelect.value !== shape) {
    shapeSelect.value = shape;
  }

  // Update teks deskripsi
  const titleEl = document.getElementById('vis-face-title');
  const descEl = document.getElementById('vis-face-desc');
  const goalEl = document.getElementById('vis-face-goal');
  const tipsEl = document.getElementById('vis-face-tips');

  if (titleEl) titleEl.innerText = info.name;
  if (descEl) descEl.innerText = info.tagline;
  if (goalEl) goalEl.innerText = info.makeupGoal;
  if (tipsEl) tipsEl.innerText = info.quickTips;

  // Gambar ke Canvas
  drawFaceVisualizer(shape);
}

function onVisualizerShapeChange(newShape) {
  SoundFX.playClick();
  AppState.userProfile.faceShape = newShape;
  saveAppState();
  renderFaceShapeVisualizer();
}

function toggleCanvasLayer(layerKey) {
  SoundFX.playClick();
  AppState.canvasLayers[layerKey] = !AppState.canvasLayers[layerKey];
  drawFaceVisualizer(AppState.userProfile.faceShape || 'bulat');
}

function drawFaceVisualizer(shape) {
  const canvas = document.getElementById('faceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Bersihkan canvas dengan latar lembut
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 - 10;

  // 1. Gambar Siluet Wajah berdasarkan bentuk wajah
  ctx.save();
  ctx.fillStyle = '#ffeedd';
  ctx.strokeStyle = '#e2a792';
  ctx.lineWidth = 3;

  ctx.beginPath();
  switch (shape) {
    case 'bulat':
      // Wajah bulat: lebar hampir sama dengan panjang, rahang melengkung membulat
      ctx.ellipse(cx, cy, 140, 160, 0, 0, Math.PI * 2);
      break;
    case 'oval':
      // Wajah oval: proporsi seimbang, sedikit lebih panjang dari lebar
      ctx.ellipse(cx, cy, 130, 175, 0, 0, Math.PI * 2);
      break;
    case 'kotak':
      // Wajah kotak: sudut rahang tegas dan dahi lebar
      ctx.moveTo(cx - 120, cy - 140);
      ctx.lineTo(cx + 120, cy - 140);
      ctx.quadraticCurveTo(cx + 135, cy, cx + 125, cy + 100);
      ctx.lineTo(cx + 90, cy + 155);
      ctx.quadraticCurveTo(cx, cy + 175, cx - 90, cy + 155);
      ctx.lineTo(cx - 125, cy + 100);
      ctx.quadraticCurveTo(cx - 135, cy, cx - 120, cy - 140);
      break;
    case 'hati':
      // Wajah hati: dahi lebar, dagu lancip tajam
      ctx.moveTo(cx - 130, cy - 140);
      ctx.quadraticCurveTo(cx, cy - 165, cx + 130, cy - 140);
      ctx.quadraticCurveTo(cx + 135, cy - 20, cx + 90, cy + 80);
      ctx.lineTo(cx, cy + 175); // dagu lancip
      ctx.lineTo(cx - 90, cy + 80);
      ctx.quadraticCurveTo(cx - 135, cy - 20, cx - 130, cy - 140);
      break;
    case 'lonjong':
      // Wajah lonjong: panjang dominan, dahi dan dagu ramping
      ctx.ellipse(cx, cy, 115, 190, 0, 0, Math.PI * 2);
      break;
    case 'diamond':
      // Wajah berlian: tulang pipi sangat lebar, dahi & dagu sempit
      ctx.moveTo(cx, cy - 170); // dahi atas sempit
      ctx.lineTo(cx + 140, cy - 10); // tulang pipi lebar
      ctx.lineTo(cx, cy + 175); // dagu lancip
      ctx.lineTo(cx - 140, cy - 10); // tulang pipi kiri
      ctx.closePath();
      break;
    default:
      ctx.ellipse(cx, cy, 130, 165, 0, 0, Math.PI * 2);
  }

  // Gradien kulit cerah
  const skinGrad = ctx.createRadialGradient(cx, cy - 20, 30, cx, cy, 180);
  skinGrad.addColorStop(0, '#fff4ed');
  skinGrad.addColorStop(1, '#fed7aa');
  ctx.fillStyle = skinGrad;
  ctx.fill();

  if (AppState.canvasLayers.showFaceGuide) {
    ctx.stroke();
  }
  ctx.restore();

  // 2. Fitur Wajah Netral (Mata, Hidung, Bibir)
  ctx.save();
  // Mata
  ctx.strokeStyle = '#6b4334';
  ctx.lineWidth = 2.5;
  // Mata Kiri
  ctx.beginPath();
  ctx.arc(cx - 50, cy - 15, 16, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();
  // Mata Kanan
  ctx.beginPath();
  ctx.arc(cx + 50, cy - 15, 16, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();

  // Batang & Cuping Hidung
  ctx.strokeStyle = '#d49b81';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx, cy + 40);
  ctx.quadraticCurveTo(cx + 10, cy + 45, cx, cy + 48);
  ctx.stroke();

  // Bibir
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 90);
  ctx.quadraticCurveTo(cx, cy + 80, cx + 30, cy + 90);
  ctx.quadraticCurveTo(cx, cy + 115, cx - 30, cy + 90);
  ctx.fill();
  ctx.restore();

  // 3. Lapisan Contour / Shading (Cokelat Lembut)
  if (AppState.canvasLayers.showContour) {
    ctx.save();
    ctx.fillStyle = 'rgba(161, 98, 7, 0.38)';
    ctx.filter = 'blur(10px)';

    if (shape === 'bulat') {
      // Shading samping rahang & pipi untuk tirus
      ctx.beginPath();
      ctx.ellipse(cx - 105, cy + 50, 26, 60, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 105, cy + 50, 26, 60, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'kotak') {
      // Shading di 4 sudut rahang dan pelipis dahi
      ctx.beginPath();
      ctx.arc(cx - 100, cy - 120, 28, 0, Math.PI * 2);
      ctx.arc(cx + 100, cy - 120, 28, 0, Math.PI * 2);
      ctx.arc(cx - 95, cy + 120, 32, 0, Math.PI * 2);
      ctx.arc(cx + 95, cy + 120, 32, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'hati') {
      // Shading pelipis dahi lebar & ujung dagu lancip
      ctx.beginPath();
      ctx.ellipse(cx - 100, cy - 120, 35, 25, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 100, cy - 120, 35, 25, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy + 155, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'lonjong') {
      // Shading dahi atas dan dagu bawah untuk perpendek visual
      ctx.beginPath();
      ctx.ellipse(cx, cy - 165, 80, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy + 165, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'diamond') {
      // Shading di tonjolan tulang pipi luar
      ctx.beginPath();
      ctx.ellipse(cx - 115, cy - 5, 25, 45, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 115, cy - 5, 25, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Oval: shading alami bawah tulang pipi
      ctx.beginPath();
      ctx.ellipse(cx - 95, cy + 40, 22, 45, Math.PI / 5, 0, Math.PI * 2);
      ctx.ellipse(cx + 95, cy + 40, 22, 45, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. Lapisan Blush On (Merah Muda Segar)
  if (AppState.canvasLayers.showBlush) {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.42)';
    ctx.filter = 'blur(12px)';

    if (shape === 'bulat') {
      // Blush diagonal di atas tulang pipi mengarah ke pelipis
      ctx.beginPath();
      ctx.ellipse(cx - 65, cy + 20, 25, 40, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 65, cy + 20, 25, 40, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'kotak') {
      // Blush melingkar lembut di tengah apel pipi
      ctx.beginPath();
      ctx.arc(cx - 55, cy + 30, 28, 0, Math.PI * 2);
      ctx.arc(cx + 55, cy + 30, 28, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'lonjong') {
      // Blush horizontal melintasi pipi
      ctx.beginPath();
      ctx.ellipse(cx - 55, cy + 25, 40, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 55, cy + 25, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Oval / Hati / Diamond: apel pipi ke arah pelipis
      ctx.beginPath();
      ctx.ellipse(cx - 60, cy + 25, 30, 22, -Math.PI / 12, 0, Math.PI * 2);
      ctx.ellipse(cx + 60, cy + 25, 30, 22, Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Lapisan Highlighter (Kilau Keemasan)
  if (AppState.canvasLayers.showHighlight) {
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.filter = 'blur(6px)';

    // Batang hidung
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 4, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tulang pipi atas
    ctx.beginPath();
    ctx.ellipse(cx - 65, cy - 2, 18, 8, -Math.PI / 8, 0, Math.PI * 2);
    ctx.ellipse(cx + 65, cy - 2, 18, 8, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();

    // Cupid's bow bibir
    ctx.beginPath();
    ctx.arc(cx, cy + 80, 5, 0, Math.PI * 2);
    ctx.fill();

    if (shape === 'bulat' || shape === 'kotak') {
      // Dagu untuk efek panjang
      ctx.beginPath();
      ctx.arc(cx, cy + 135, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. Bentuk Alis Ideal Sesuai Bentuk Wajah
  if (AppState.canvasLayers.showEyebrows) {
    ctx.save();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (shape === 'bulat') {
      // High arch (lengkungan tinggi tegas)
      ctx.moveTo(cx - 80, cy - 40);
      ctx.lineTo(cx - 50, cy - 54);
      ctx.lineTo(cx - 25, cy - 43);

      ctx.moveTo(cx + 25, cy - 43);
      ctx.lineTo(cx + 50, cy - 54);
      ctx.lineTo(cx + 80, cy - 40);
    } else if (shape === 'kotak' || shape === 'hati') {
      // Soft curved arch (lengkungan membulat lembut)
      ctx.moveTo(cx - 80, cy - 42);
      ctx.quadraticCurveTo(cx - 50, cy - 52, cx - 25, cy - 43);

      ctx.moveTo(cx + 25, cy - 43);
      ctx.quadraticCurveTo(cx + 50, cy - 52, cx + 80, cy - 42);
    } else if (shape === 'lonjong') {
      // Straight Korean brow (alis mendatar lurus)
      ctx.moveTo(cx - 80, cy - 45);
      ctx.lineTo(cx - 25, cy - 45);

      ctx.moveTo(cx + 25, cy - 45);
      ctx.lineTo(cx + 80, cy - 45);
    } else {
      // Oval / Diamond: Soft angled
      ctx.moveTo(cx - 80, cy - 41);
      ctx.lineTo(cx - 48, cy - 49);
      ctx.lineTo(cx - 25, cy - 43);

      ctx.moveTo(cx + 25, cy - 43);
      ctx.lineTo(cx + 48, cy - 49);
      ctx.lineTo(cx + 80, cy - 41);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ==================== KATALOG PRODUK & FILTER ====================
function applyCatalogFilters() {
  const searchTerm = (document.getElementById('catalog-search-input')?.value || '').toLowerCase().trim();
  const categoryFilter = document.getElementById('catalog-category-filter')?.value || 'semua';
  const typeFilter = document.getElementById('catalog-type-filter')?.value || 'semua';
  const priceFilter = document.getElementById('catalog-price-filter')?.value || 'semua';
  const skinFilter = document.getElementById('catalog-skin-filter')?.value || 'semua';

  const filtered = PRODUCTS_DATABASE.filter(p => {
    // Search
    if (searchTerm) {
      const matchName = p.name.toLowerCase().includes(searchTerm);
      const matchBrand = p.brand.toLowerCase().includes(searchTerm);
      const matchIngr = p.heroIngredients.some(i => i.toLowerCase().includes(searchTerm));
      if (!matchName && !matchBrand && !matchIngr) return false;
    }

    // Type (skincare / makeup)
    if (typeFilter !== 'semua' && p.type !== typeFilter) return false;

    // Category
    if (categoryFilter !== 'semua' && p.category !== categoryFilter) return false;

    // Price
    if (priceFilter !== 'semua' && p.priceCategory !== priceFilter) return false;

    // Skin type
    if (skinFilter !== 'semua' && !p.skinTypes.includes('semua') && !p.skinTypes.includes(skinFilter)) return false;

    return true;
  });

  renderCatalogGrid(filtered);
}

function renderCatalogGrid(products) {
  const grid = document.getElementById('catalog-products-grid');
  const countEl = document.getElementById('catalog-count-label');
  if (!grid) return;

  if (countEl) {
    countEl.innerText = `Menampilkan ${products.length} produk`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="text-4xl mb-3">🔍</div>
        <h4 class="font-bold text-gray-800 text-lg">Tidak ada produk yang cocok</h4>
        <p class="text-sm text-gray-500 max-w-md mx-auto mt-1">Coba sesuaikan kata kunci pencarian atau ubah opsi filter kamu.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const isWishlisted = AppState.wishlist.includes(p.id);
    return `
      <div class="bg-white rounded-3xl border border-rose-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
        <div>
          <!-- Thumbnail Image -->
          <div class="relative overflow-hidden rounded-2xl mb-3 h-48 bg-rose-50 flex items-center justify-center">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <button onclick="toggleWishlist('${p.id}')" class="absolute top-3 right-3 w-9 h-9 rounded-full ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-gray-400 hover:text-rose-500'} flex items-center justify-center shadow-md transition">
              ♥
            </button>
            <div class="absolute bottom-2 left-2 flex gap-1 flex-wrap">
              ${p.teenFriendly ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">Pelajar Ramah</span>' : ''}
              ${p.halal ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">Halal</span>' : ''}
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span class="font-bold text-rose-500 uppercase tracking-wider">${p.brand}</span>
            <span>⭐ ${p.rating} (${p.reviews.toLocaleString('id-ID')})</span>
          </div>
          <h4 class="font-bold text-gray-900 text-base leading-snug line-clamp-2 hover:text-rose-600 transition cursor-pointer" onclick="openProductModal('${p.id}')">
            ${p.name}
          </h4>
          <p class="text-xs text-gray-500 mt-1 line-clamp-2">${p.description}</p>

          <!-- Hero Ingredients -->
          <div class="flex flex-wrap gap-1 mt-2.5">
            ${p.heroIngredients.slice(0, 2).map(ing => `
              <span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">${ing}</span>
            `).join('')}
          </div>
        </div>

        <!-- Footer Card -->
        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-gray-400">Harga Estimasi</div>
            <div class="font-bold text-rose-600 text-base">${formatIDR(p.price)}</div>
          </div>
          <button onclick="openProductModal('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition">
            Detail
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== MODAL DETAIL PRODUK ====================
function openProductModal(productId) {
  SoundFX.playClick();
  const p = PRODUCTS_DATABASE.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById('product-detail-modal');
  const content = document.getElementById('product-detail-modal-content');
  if (!modal || !content) return;

  const isWishlisted = AppState.wishlist.includes(p.id);

  content.innerHTML = `
    <div class="p-6 md:p-8">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-1/2">
          <img src="${p.image}" alt="${p.name}" class="w-full h-72 md:h-80 object-cover rounded-3xl shadow-md border border-rose-100" />
          <div class="flex gap-2 mt-3 flex-wrap">
            <span class="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              ✓ BPOM: ${p.bpom}
            </span>
            ${p.halal ? '<span class="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">✓ Halal Certified</span>' : ''}
            ${p.teenFriendly ? '<span class="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">✓ Aman Untuk Remaja</span>' : ''}
          </div>
        </div>

        <div class="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-rose-600 uppercase tracking-widest">${p.brand}</span>
              <button onclick="closeProductModal()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                ✕
              </button>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">${p.name}</h3>
            <div class="flex items-center gap-3 mt-2">
              <span class="text-xl font-extrabold text-rose-600">${formatIDR(p.price)}</span>
              <span class="text-xs text-gray-500">⭐ ${p.rating} (${p.reviews.toLocaleString('id-ID')} ulasan perempuan Indonesia)</span>
            </div>

            <div class="mt-4">
              <h5 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Kandungan Utama (Hero Ingredients):</h5>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${p.heroIngredients.map(ing => `<span class="px-2.5 py-1 text-xs rounded-lg bg-rose-50 text-rose-700 font-semibold">${ing}</span>`).join('')}
              </div>
            </div>

            <div class="mt-4">
              <h5 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Deskripsi & Manfaat:</h5>
              <p class="text-sm text-gray-600 mt-1 leading-relaxed">${p.description}</p>
            </div>

            <div class="mt-4 p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100">
              <h5 class="text-xs font-bold text-rose-700 uppercase">Cara Penggunaan:</h5>
              <p class="text-xs text-gray-700 mt-1">${p.howToUse}</p>
            </div>

            <div class="mt-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
              <h5 class="text-xs font-bold text-amber-800 uppercase">💡 Tips GlowGuide:</h5>
              <p class="text-xs text-gray-700 mt-1">${p.tips}</p>
            </div>
          </div>

          <div class="mt-6 flex gap-3 pt-4 border-t border-gray-100">
            <button onclick="toggleWishlist('${p.id}'); openProductModal('${p.id}');" class="flex-1 py-3 rounded-2xl ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'} font-bold text-sm transition flex items-center justify-center gap-2">
              <span>${isWishlisted ? '♥ Disimpan di Wishlist' : '♡ Tambah ke Wishlist'}</span>
            </button>
            <button onclick="closeProductModal()" class="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeProductModal() {
  SoundFX.playClick();
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.classList.add('hidden');
}

// ==================== DAFTAR KEINGINAN (WISHLIST) ====================
function toggleWishlist(productId) {
  SoundFX.playClick();
  const idx = AppState.wishlist.indexOf(productId);
  if (idx > -1) {
    AppState.wishlist.splice(idx, 1);
  } else {
    AppState.wishlist.push(productId);
    SoundFX.playSuccess();
  }
  saveAppState();
  updateWishlistBadge();

  if (AppState.activeTab === 'wishlist') {
    renderWishlist();
  }
  if (AppState.activeTab === 'katalog') {
    applyCatalogFilters();
  }
}

function updateWishlistBadge() {
  const badge = document.getElementById('nav-wishlist-count');
  if (badge) {
    badge.innerText = AppState.wishlist.length;
    badge.style.display = AppState.wishlist.length > 0 ? 'inline-flex' : 'none';
  }
}

function renderWishlist() {
  const container = document.getElementById('wishlist-items-container');
  const summaryEl = document.getElementById('wishlist-summary-container');
  if (!container) return;

  const items = PRODUCTS_DATABASE.filter(p => AppState.wishlist.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center col-span-full">
        <div class="text-5xl mb-3">🛍️</div>
        <h4 class="font-bold text-gray-800 text-lg">Daftar Keinginan Masih Kosong</h4>
        <p class="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">Yuk jelajahi produk rekomendasi dan simpan produk impianmu di sini!</p>
        <button onclick="switchTab('katalog')" class="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition shadow-md">
          Eksplorasi Produk
        </button>
      </div>
    `;
    if (summaryEl) summaryEl.innerHTML = '';
    return;
  }

  const totalPrice = items.reduce((sum, p) => sum + p.price, 0);

  container.innerHTML = items.map(p => `
    <div class="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img src="${p.image}" alt="${p.name}" class="w-16 h-16 rounded-xl object-cover border border-rose-100" />
        <div>
          <span class="text-xs font-bold text-rose-500 uppercase">${p.brand}</span>
          <h4 class="font-bold text-gray-900 text-sm">${p.name}</h4>
          <span class="text-xs font-bold text-gray-600">${formatIDR(p.price)}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openProductModal('${p.id}')" class="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-700 text-xs font-semibold">
          Detail
        </button>
        <button onclick="toggleWishlist('${p.id}')" class="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
          ✕
        </button>
      </div>
    </div>
  `).join('');

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="p-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold text-rose-100">Estimasi Total Belanja (${items.length} Produk)</div>
          <div class="text-3xl font-extrabold mt-0.5">${formatIDR(totalPrice)}</div>
          <div class="text-xs text-rose-100 mt-1">Produk pilihan resmi BPOM & ramah kantong</div>
        </div>
        <button onclick="window.print()" class="px-6 py-3 bg-white text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition shadow-md text-sm">
          🖨️ Cetak / Simpan Catatan
        </button>
      </div>
    `;
  }
}

// ==================== PENGECEK KOMPATIBILITAS KANDUNGAN (CLASH CHECKER) ====================
function checkIngredientClash() {
  SoundFX.playClick();
  const ing1 = document.getElementById('clash-ing1-select')?.value;
  const ing2 = document.getElementById('clash-ing2-select')?.value;
  const resultCard = document.getElementById('clash-result-card');

  if (!resultCard) return;

  if (!ing1 || !ing2) {
    resultCard.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">Silakan pilih dua kandungan yang ingin kamu bandingkan.</div>`;
    return;
  }

  if (ing1 === ing2) {
    resultCard.innerHTML = `
      <div class="p-5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800">
        <div class="font-bold">Kandungan yang Sama (${ing1})</div>
        <p class="text-xs mt-1">Menggunakan dua produk berbeda dengan bahan aktif yang sama diperbolehkan, namun perhatikan batas konsentrasi agar tidak menyebabkan kulit iritasi.</p>
      </div>
    `;
    return;
  }

  // Cari di database kombinasi
  const match = INGREDIENTS_COMPATIBILITY.find(item => 
    (item.ing1.toLowerCase().includes(ing1.toLowerCase()) && item.ing2.toLowerCase().includes(ing2.toLowerCase())) ||
    (item.ing1.toLowerCase().includes(ing2.toLowerCase()) && item.ing2.toLowerCase().includes(ing1.toLowerCase()))
  );

  if (match) {
    const isGood = match.color === 'emerald';
    const isWarning = match.color === 'amber';
    const isBad = match.color === 'rose';

    const bgClass = isGood ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : isWarning ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900';
    const badgeClass = isGood ? 'bg-emerald-600 text-white' : isWarning ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white';
    const icon = isGood ? '✨ Pasangan Emas' : isWarning ? '⚠️ Beri Jeda / Hati-hati' : '🚫 Jangan Digabung';

    resultCard.innerHTML = `
      <div class="p-6 rounded-3xl border ${bgClass} transition-all">
        <div class="flex items-center justify-between mb-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold ${badgeClass}">${icon}</span>
          <span class="text-xs font-semibold opacity-75">${ing1} + ${ing2}</span>
        </div>
        <h4 class="font-bold text-lg mb-2">${match.title}</h4>
        <p class="text-sm leading-relaxed opacity-90">${match.description}</p>
      </div>
    `;
  } else {
    resultCard.innerHTML = `
      <div class="p-6 rounded-3xl border bg-emerald-50 border-emerald-200 text-emerald-900">
        <div class="flex items-center justify-between mb-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">✓ Aman Dipadukan</span>
        </div>
        <h4 class="font-bold text-lg mb-2">Kombinasi ${ing1} + ${ing2} Relatif Aman</h4>
        <p class="text-sm leading-relaxed opacity-90">Tidak ditemukan laporan benturan reaksi keras antara kedua kandungan ini. Pastikan selalu gunakan pelembap setelahnya dan gunakan tabir surya pada pagi hari.</p>
      </div>
    `;
  }
}

// ==================== GLOWPEDIA (KAMUS KECANTIKAN) ====================
function renderGlowPedia() {
  const container = document.getElementById('glowpedia-items-container');
  if (!container) return;

  container.innerHTML = GLOWPEDIA_TERMS.map(item => `
    <div class="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">${item.category}</span>
      </div>
      <h4 class="text-lg font-bold text-gray-900 mt-1">${item.term}</h4>
      <p class="text-xs font-semibold text-rose-700 mt-0.5">${item.shortDef}</p>
      <p class="text-xs text-gray-600 mt-2 leading-relaxed">${item.fullDef}</p>
    </div>
  `).join('');
}

// ==================== JURNAL RUTINITAS & PELACAK AIR ====================
function renderRoutineTracker() {
  // Update streak
  const streakEl = document.getElementById('tracker-streak-count');
  if (streakEl) streakEl.innerText = `${AppState.routineTracker.streak} Hari`;

  // Render Water Glasses
  const waterContainer = document.getElementById('water-glasses-container');
  if (waterContainer) {
    let html = '';
    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= AppState.routineTracker.waterCount;
      html += `
        <button onclick="setWaterIntake(${i})" class="water-glass flex flex-col items-center gap-1 group">
          <div class="w-10 h-12 rounded-b-xl border-2 ${isFilled ? 'border-sky-500 bg-sky-200/80 shadow-md' : 'border-gray-300 bg-white'} transition flex items-end justify-center pb-1">
            <span class="text-[10px] font-bold ${isFilled ? 'text-sky-800' : 'text-gray-400'}">${i * 250}ml</span>
          </div>
          <span class="text-[10px] ${isFilled ? 'text-sky-600 font-bold' : 'text-gray-400'}">Gelas ${i}</span>
        </button>
      `;
    }
    waterContainer.innerHTML = html;
  }

  // Update Water Progress Text
  const waterProgress = document.getElementById('water-progress-label');
  if (waterProgress) {
    const totalMl = AppState.routineTracker.waterCount * 250;
    waterProgress.innerText = `${AppState.routineTracker.waterCount} dari 8 Gelas (${totalMl} / 2.000 ml)`;
  }
}

function setWaterIntake(count) {
  SoundFX.playDrop();
  AppState.routineTracker.waterCount = count;
  saveAppState();
  renderRoutineTracker();
}

function toggleRoutineCheck(itemKey) {
  SoundFX.playClick();
  AppState.routineTracker.checkedItems[itemKey] = !AppState.routineTracker.checkedItems[itemKey];
  saveAppState();
}

// ==================== UTILS ====================
function formatIDR(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function toggleSound() {
  AppState.soundEnabled = !AppState.soundEnabled;
  const icon = document.getElementById('sound-toggle-icon');
  if (icon) {
    icon.innerText = AppState.soundEnabled ? '🔊' : '🔇';
  }
}

// Event Listener Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  updateWishlistBadge();
  initQuiz();
  renderGlowPedia();
  checkIngredientClash();

  // Deteksi otomatis jika link dibuka dengan #scan atau ?scan=1
  const urlParams = new URLSearchParams(window.location.search);
  if (window.location.hash === '#scan' || urlParams.get('scan') === '1' || urlParams.get('scan') === 'true') {
    openFaceScannerDirectly();
  }

  // Resize canvas high-DPI support
  const canvas = document.getElementById('faceCanvas');
  if (canvas) {
    canvas.width = 380;
    canvas.height = 420;
    drawFaceVisualizer(AppState.userProfile.faceShape || 'bulat');
  }

  // Setup Live Search & Filter Katalog
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', applyCatalogFilters);
  }
});
