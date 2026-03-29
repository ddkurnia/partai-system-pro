// ==========================================
// CORE APP CONTROLLER
// ==========================================
const App = {
  modules: {},
  order: ['Firebase', 'Globals', 'Theme', 'Wilayah', 'Navigation', 'Hero', 'Auth', 'Berita', 'Map', 'Dashboard', 'Analytics', 'Store', 'Profile'],

  register: function(name, module) {
    this.modules[name] = module;
  },

  init: function() {
    this.order.forEach(name => {
      this.safeRun(name, 'init');
    });
  },

  safeRun: function(moduleName, methodName, ...args) {
    try {
      const module = this.modules[moduleName];
      if (!module) return null;
      const method = module[methodName];
      if (typeof method !== 'function') return null;
      return method.apply(module, args);
    } catch (error) {
      console.error(`[App Error] ${moduleName}.${methodName}`, error);
      return null;
    }
  }
};

// ==========================================
// FIREBASE MODULE
// ==========================================
const Firebase = {
  app: null,
  auth: null,
  db: null,

  init: function() {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyBSahPLj7pPM36Ktqr47sOhIJ4AhNh_yV0",
        authDomain: "partai-meranti.firebaseapp.com",
        projectId: "partai-meranti",
        storageBucket: "partai-meranti.appspot.com"
      };
      this.app = firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
    } catch (error) {
      console.error('[Firebase] Init error:', error);
    }
  },

  getAuth: function() {
    return this.auth;
  },

  getDb: function() {
    return this.db;
  }
};

// ==========================================
// GLOBALS MODULE
// ==========================================
const Globals = {
  data: {
    currentUserData: null,
    unsubUser: null,
    mapMarkers: {},
    map: null,
    slideIndex: 0,
    analyticsChart: null
  },

  init: function() {},

  set: function(key, value) {
    this.data[key] = value;
  },

  get: function(key) {
    return this.data[key];
  }
};

// ==========================================
// THEME MODULE
// ==========================================
const Theme = {
  init: function() {
    this.loadTheme();
  },

  toggleTheme: function() {
    try {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      document.querySelector('#themeBtn i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';

      const chart = App.safeRun('Globals', 'get', 'analyticsChart');
      if (chart) this.updateChartTheme(chart);
    } catch (error) {
      console.error('[Theme] toggleTheme error:', error);
    }
  },

  loadTheme: function() {
    try {
      if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.querySelector('#themeBtn i').className = 'fas fa-sun';
      }
    } catch (error) {
      console.error('[Theme] loadTheme error:', error);
    }
  },

  updateChartTheme: function(chart) {
    try {
      const isDark = document.body.classList.contains("dark-mode");
      chart.options.plugins.legend.labels.color = isDark ? '#9CA3AF' : '#64748b';
      chart.update();
    } catch (error) {
      console.error('[Theme] updateChartTheme error:', error);
    }
  }
};

// ==========================================
// WILAYAH MODULE
// ==========================================
const Wilayah = {
  API_WILAYAH: "https://www.emsifa.com/api-wilayah-indonesia/api",

  init: function() {},

  fetchWilayah: async function(url) {
    try {
      const r = await fetch(url);
      return r.json();
    } catch (e) {
      console.error('[Wilayah] fetch error:', e);
      return [];
    }
  },

  loadProvinces: async function() {
    try {
      const s = document.getElementById('regProvinsi');
      if (!s) return;
      s.innerHTML = '<option value="">Pilih Provinsi</option>';
      const data = await this.fetchWilayah(`${this.API_WILAYAH}/provinces.json`);
      data.forEach(p => {
        s.innerHTML += `<option value="${p.id}" data-name="${p.name}">${p.name}</option>`;
      });
    } catch (error) {
      console.error('[Wilayah] loadProvinces error:', error);
    }
  },

  loadKabupaten: async function(pid) {
    try {
      const s = document.getElementById('regKabupaten');
      const s2 = document.getElementById('regKecamatan');
      const s3 = document.getElementById('regDesa');

      s.innerHTML = '<option value="">Memuat...</option>';
      s.disabled = true;
      s2.innerHTML = '<option value="">Pilih Kabupaten</option>';
      s2.disabled = true;
      s3.innerHTML = '<option value="">Pilih Kecamatan</option>';
      s3.disabled = true;

      if (!pid) return;

      const data = await this.fetchWilayah(`${this.API_WILAYAH}/regencies/${pid}.json`);
      data.forEach(k => {
        s.innerHTML += `<option value="${k.id}" data-name="${k.name}">${k.name}</option>`;
      });
      s.disabled = false;
    } catch (error) {
      console.error('[Wilayah] loadKabupaten error:', error);
    }
  },

  loadKecamatan: async function(kid) {
    try {
      const s = document.getElementById('regKecamatan');
      const s2 = document.getElementById('regDesa');

      s.innerHTML = '<option value="">Memuat...</option>';
      s.disabled = true;
      s2.innerHTML = '<option value="">Pilih Kecamatan</option>';
      s2.disabled = true;

      if (!kid) return;

      const data = await this.fetchWilayah(`${this.API_WILAYAH}/districts/${kid}.json`);
      data.forEach(k => {
        s.innerHTML += `<option value="${k.id}" data-name="${k.name}">${k.name}</option>`;
      });
      s.disabled = false;
    } catch (error) {
      console.error('[Wilayah] loadKecamatan error:', error);
    }
  },

  loadDesa: async function(kid) {
    try {
      const s = document.getElementById('regDesa');
      s.innerHTML = '<option value="">Memuat...</option>';
      s.disabled = true;

      if (!kid) return;

      const data = await this.fetchWilayah(`${this.API_WILAYAH}/villages/${kid}.json`);
      data.forEach(d => {
        s.innerHTML += `<option value="${d.id}" data-name="${d.name}">${d.name}</option>`;
      });
      s.disabled = false;
    } catch (error) {
      console.error('[Wilayah] loadDesa error:', error);
    }
  }
};

// ==========================================
// NAVIGATION MODULE
// ==========================================
const Navigation = {
  init: function() {},

  showView: function(id) {
    try {
      document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active'));
      document.getElementById('view-' + id).classList.add('active');
      window.scrollTo(0, 0);

      const nav = document.querySelectorAll('.nav-item');
      nav.forEach(n => n.classList.remove('active'));

      if (id === 'beranda') nav[0].classList.add('active');
      if (id === 'store') nav[1].classList.add('active');
      if (id === 'dashboard') nav[2].classList.add('active');
    } catch (error) {
      console.error('[Navigation] showView error:', error);
    }
  },

  showDashboardSection: function(sec) {
    try {
      document.querySelectorAll('[id^="dash-"]').forEach(e => e.style.display = 'none');
      document.getElementById('dash-' + sec).style.display = 'block';

      if (sec === 'peta') {
        const map = App.safeRun('Globals', 'get', 'map');
        if (!map) App.safeRun('Map', 'initMap');
      }
    } catch (error) {
      console.error('[Navigation] showDashboardSection error:', error);
    }
  },

  navigateToDashboard: function() {
    try {
      const auth = App.safeRun('Firebase', 'getAuth');
      if (auth.currentUser) {
        this.showView('dashboard');
      } else {
        this.openAuthModal();
      }
    } catch (error) {
      console.error('[Navigation] navigateToDashboard error:', error);
    }
  },

  openAuthModal: function() {
    try {
      document.getElementById('authModal').style.display = 'flex';
    } catch (error) {
      console.error('[Navigation] openAuthModal error:', error);
    }
  },

  closeAuthModal: function() {
    try {
      document.getElementById('authModal').style.display = 'none';
    } catch (error) {
      console.error('[Navigation] closeAuthModal error:', error);
    }
  },

  showReg: function() {
    try {
      document.getElementById('loginForm').classList.remove('active');
      document.getElementById('registerForm').classList.add('active');
      document.getElementById('resetForm').classList.remove('active');
    } catch (error) {
      console.error('[Navigation] showReg error:', error);
    }
  },

  showLog: function() {
    try {
      document.getElementById('loginForm').classList.add('active');
      document.getElementById('registerForm').classList.remove('active');
      document.getElementById('resetForm').classList.remove('active');
    } catch (error) {
      console.error('[Navigation] showLog error:', error);
    }
  },

  showResetPassword: function() {
    try {
      document.getElementById('loginForm').classList.remove('active');
      document.getElementById('registerForm').classList.remove('active');
      document.getElementById('resetForm').classList.add('active');
    } catch (error) {
      console.error('[Navigation] showResetPassword error:', error);
    }
  }
};

// ==========================================
// HERO MODULE
// ==========================================
const Hero = {
  slideIndex: 0,
  slideTimer: null,

  init: function() {
    this.startSlider();
  },

  updateSlide: function() {
    try {
      const slides = document.querySelectorAll('.hero-slide');
      const dots = document.querySelectorAll('.dot');

      slides.forEach((s, i) => {
        s.classList.remove('active');
        dots[i].classList.remove('active');
      });

      this.slideIndex++;
      if (this.slideIndex > slides.length) this.slideIndex = 1;

      slides[this.slideIndex - 1].classList.add('active');
      dots[this.slideIndex - 1].classList.add('active');

      this.slideTimer = setTimeout(() => this.updateSlide(), 4000);
    } catch (error) {
      console.error('[Hero] updateSlide error:', error);
    }
  },

  startSlider: function() {
    this.slideTimer = setTimeout(() => this.updateSlide(), 4000);
  },

  goToSlide: function(index) {
    try {
      clearTimeout(this.slideTimer);
      this.slideIndex = index;

      const slides = document.querySelectorAll('.hero-slide');
      const dots = document.querySelectorAll('.dot');

      slides.forEach((s, i) => {
        s.classList.remove('active');
        dots[i].classList.remove('active');
      });

      slides[index].classList.add('active');
      dots[index].classList.add('active');

      this.slideTimer = setTimeout(() => this.updateSlide(), 4000);
    } catch (error) {
      console.error('[Hero] goToSlide error:', error);
    }
  }
};

// ==========================================
// AUTH MODULE
// ==========================================
const Auth = {
  _lastUid: null,

  init: function() {
    this.listenAuthState();
  },

  listenAuthState: function() {
    try {
      const auth = App.safeRun('Firebase', 'getAuth');
      const db = App.safeRun('Firebase', 'getDb');
      const self = this;

      auth.onAuthStateChanged(async (user) => {
        // === USER BELUM LOGIN → RESET STATE ===
        if (!user) {
          self._lastUid = null;

          const userEl = document.getElementById('user');
          if (userEl) userEl.innerHTML = '';
          App.safeRun('Globals', 'set', 'currentUserData', null);

          const unsubUser = App.safeRun('Globals', 'get', 'unsubUser');
          if (unsubUser) unsubUser();

          const mapMarkers = App.safeRun('Globals', 'get', 'mapMarkers');
          const map = App.safeRun('Globals', 'get', 'map');
          if (mapMarkers && map) {
            Object.values(mapMarkers).forEach(m => map.removeLayer(m));
            App.safeRun('Globals', 'set', 'mapMarkers', {});
          }

          const viewDashboard = document.getElementById('view-dashboard');
          if (viewDashboard && viewDashboard.classList.contains('active')) {
            App.safeRun('Navigation', 'showView', 'beranda');
          }
          return;
        }

        // === ANTI DOUBLE FIRE: skip kalau user ini sudah diproses ===
        if (user.uid === self._lastUid) return;

        // SET UID SEKARANG sebelum async, agar tidak double-process
        self._lastUid = user.uid;

        try {
          const doc = await db.collection("users").doc(user.uid).get();
          if (!doc.exists) {
            console.error("DOC NOT FOUND for uid:", user.uid);
            return;
          }

          const data = doc.data();
          const role = String(data.role || '').trim().toLowerCase();

          console.log("AUTH CHECK → uid:", user.uid, "role:", role);

          // ADMIN → REDIRECT KE ADMIN.HTML
          if (role === 'admin') {
            window.location.href = "admin.html";
            return;
          }

          // CEK EMAIL VERIFIED
          if (!user.emailVerified) {
            alert("Silakan verifikasi email terlebih dahulu.");
            self._lastUid = null;
            await auth.signOut();
            return;
          }

          // USER BIASA (KADER) → TETAP DI HALAMAN UTAMA
          App.safeRun('Globals', 'set', 'currentUserData', data);
          App.safeRun('Auth', 'renderUserInfo');
          App.safeRun('Navigation', 'closeAuthModal');
          App.safeRun('Navigation', 'showView', 'dashboard');
          App.safeRun('Map', 'initMap');
          App.safeRun('Map', 'updateMyLocation', user);
          App.safeRun('Map', 'listenToOtherUsers');
          App.safeRun('Auth', 'loadData');
          App.safeRun('Auth', 'loadLeaderboard');
          App.safeRun('Dashboard', 'loadTugasBulanan', user.uid);
          App.safeRun('Auth', 'loadReward', user.uid);
          App.safeRun('Auth', 'loadStats');

        } catch (err) {
          console.error("ERROR GET DATA:", err);
        }
      });
    } catch (error) {
      console.error('[Auth] listenAuthState error:', error);
    }
  },

  renderUserInfo: function() {
    try {
      const currentUserData = App.safeRun('Globals', 'get', 'currentUserData');
      if (!currentUserData) return;

      const p = currentUserData.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUserData.nama);
      document.getElementById('user').innerHTML = `
        <div style="display:flex;align-items:center;gap:15px">
          <img src="${p}" style="width:60px;height:60px;border-radius:50%;border:3px solid var(--border-color)">
          <div>
            <span style="font-size:1.2rem;font-weight:800">${currentUserData.nama}</span>
            <div style="font-size:0.9rem;color:var(--gold)"><i class="fas fa-coins"></i> ${currentUserData.poin || 0} Poin</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:15px">
          <button class="btn-secondary" onclick="openEditModal()">Edit Profil</button>
          <button class="btn-logout" onclick="logout()">Keluar</button>
        </div>`;
    } catch (error) {
      console.error('[Auth] renderUserInfo error:', error);
    }
  },

  signup: async function() {
    try {
      const getVal = (id) => document.getElementById(id).value;
      const getTxt = (id) => document.getElementById(id).options[document.getElementById(id).selectedIndex]?.getAttribute('data-name') || "";
      const getId = (id) => document.getElementById(id).value;

      const data = {
        nama: getVal('regNama'),
        nohp: getVal('regNohp'),
        provinsi: getTxt('regProvinsi'),
        provinsi_id: getId('regProvinsi'),
        kabupaten: getTxt('regKabupaten'),
        kabupaten_id: getId('regKabupaten'),
        kecamatan: getTxt('regKecamatan'),
        kecamatan_id: getId('regKecamatan'),
        desa: getTxt('regDesa'),
        desa_id: getId('regDesa'),
        jabatan: getVal('regJabatan'),
        email: getVal('regEmail'),
        status: 'Aktif'
      };

      const pass = getVal('regPassword');
      if (!data.nama || !data.nohp || !data.kecamatan || !data.email || !pass) return alert("Lengkapi data!");

      const auth = App.safeRun('Firebase', 'getAuth');
      const db = App.safeRun('Firebase', 'getDb');

      const res = await auth.createUserWithEmailAndPassword(data.email, pass);
      await res.user.sendEmailVerification();
      await db.collection("users").doc(res.user.uid).set({
        ...data,
        role: 'kader',
        poin: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Sukses! Cek email verifikasi.");
      App.safeRun('Navigation', 'showLog');
    } catch (e) {
      console.error('[Auth] signup error:', e);
      alert(e.message);
    }
  },

  login: async function() {
    try {
      const auth = App.safeRun('Firebase', 'getAuth');

      await auth.signInWithEmailAndPassword(
        document.getElementById('loginEmail').value,
        document.getElementById('loginPassword').value
      );

      // Login berhasil — onAuthStateChanged yang handle semuanya:
      // cek email verified, cek role dari Firestore, render dashboard, dll.
      // Jangan tambahkan logic apapun di sini.

    } catch (e) {
      console.error('[Auth] login error:', e);
      alert(e.message);
    }
  },

  resetPassword: async function() {
    try {
      const email = document.getElementById('resetEmail').value;
      if (!email) return alert("Email?");
      const auth = App.safeRun('Firebase', 'getAuth');
      await auth.sendPasswordResetEmail(email);
      alert("Link terkirim!");
    } catch (e) {
      console.error('[Auth] resetPassword error:', e);
      alert(e.message);
    }
  },

  logout: function() {
    try {
      const auth = App.safeRun('Firebase', 'getAuth');
      auth.signOut();
    } catch (error) {
      console.error('[Auth] logout error:', error);
    }
  },

  loadData: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection("laporan").orderBy("waktu", "desc").limit(5).onSnapshot(s => {
        let h = "";
        s.forEach(d => {
          const v = d.data();
          h += `<li><b>${v.nama}</b><br>${v.masalah}</li>`;
        });
        document.getElementById('data').innerHTML = h || 'Kosong';
      });
    } catch (error) {
      console.error('[Auth] loadData error:', error);
    }
  },

  loadLeaderboard: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection("users").orderBy("poin", "desc").limit(10).onSnapshot(s => {
        let h = "";
        let i = 1;
        s.forEach(d => {
          const v = d.data();
          h += `<li><b>#${i}</b> ${v.nama} <span style="margin-left:auto">${v.poin}</span></li>`;
          i++;
        });
        document.getElementById('leaderboard').innerHTML = h || 'Kosong';

        let h2 = "";
        let i2 = 1;
        s.docs.slice(0, 3).forEach(d => {
          const v = d.data();
          h2 += `<div class="leaderboard-item">
            <div class="lb-rank r${i2}">${i2}</div>
            <img src="${v.photoURL || 'https://ui-avatars.com/api/?name=' + v.nama}" class="lb-avatar-sm">
            <div class="lb-info">
              <div class="lb-name-sm">${v.nama}</div>
              <div class="lb-poin-sm">${v.poin} poin</div>
            </div>
          </div>`;
          i2++;
        });
        document.getElementById('topKaderList').innerHTML = h2 || 'Belum ada data';
      });
    } catch (error) {
      console.error('[Auth] loadLeaderboard error:', error);
    }
  },

  loadReward: function(u) {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection('users').doc(u).onSnapshot(d => {
        const p = d.data()?.poin || 0;
        document.getElementById('rewardCatalog').innerHTML = `
          <div class="reward-item">
            <div class="reward-info">
              <h4>Token Listrik</h4>
              <small>1000 Poin</small>
            </div>
            <button style="width:auto; padding:8px 16px" ${p >= 1000 ? '' : 'disabled'}>${p >= 1000 ? 'Tukar' : 'Kurang'}</button>
          </div>`;
      });
    } catch (error) {
      console.error('[Auth] loadReward error:', error);
    }
  },

  loadStats: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection("users").onSnapshot(s => {
        document.getElementById('statKader').innerText = s.size;
      });
      db.collection("laporan").onSnapshot(s => {
        document.getElementById('statLaporan').innerText = s.size;
      });
      db.collection("produk").onSnapshot(s => {
        document.getElementById('statProduk').innerText = s.size;
      });
    } catch (error) {
      console.error('[Auth] loadStats error:', error);
    }
  }
};

// ==========================================
// BERITA MODULE (Real-time dari Admin)
// ==========================================
const Berita = {
  init: function() {
    this.listenBerita();
  },

  listenBerita: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');

      db.collection('berita')
        .where('aktif', '==', true)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
          const container = document.getElementById('beritaList');
          if (!container) return;

          if (snap.empty) {
            container.innerHTML = `
              <div style="text-align:center;padding:30px;color:var(--text-muted)">
                <i class="fas fa-newspaper" style="font-size:36px;opacity:0.3;margin-bottom:10px;display:block"></i>
                <p>Belum ada berita atau pengumuman</p>
              </div>`;
            return;
          }

          let html = '';
          snap.forEach(doc => {
            const b = doc.data();
            const id = doc.id;
            const tgl = b.createdAt ? new Date(b.createdAt.toDate()).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            }) : '';
            const isPengumuman = b.kategori === 'pengumuman';
            const badgeColor = isPengumuman ? '#F59E0B' : '#E31E25';
            const badgeBg = isPengumuman ? '#FEF3C7' : '#FEE2E2';
            const badgeIcon = isPengumuman ? '📢' : '📰';
            const badgeLabel = isPengumuman ? 'Pengumuman' : 'Berita';
            const thumb = b.foto || '';
            const shortIsi = b.isi.length > 100 ? b.isi.substring(0, 100) + '...' : b.isi;

            if (thumb) {
              // Card dengan foto
              html += `
                <div class="berita-card" onclick="openBeritaDetail('${id}')" style="cursor:pointer">
                  <img src="${thumb}" class="berita-card-img" onerror="this.style.display='none'">
                  <div class="berita-card-body">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                      <span style="background:${badgeBg};color:${badgeColor};padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600">${badgeIcon} ${badgeLabel}</span>
                      <span style="font-size:0.75rem;color:var(--text-muted)"><i class="fas fa-clock"></i> ${tgl}</span>
                    </div>
                    <div style="font-size:1rem;font-weight:700;margin-bottom:6px;line-height:1.4">${b.judul}</div>
                    <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.5">${shortIsi}</div>
                  </div>
                </div>`;
            } else {
              // Card tanpa foto
              html += `
                <div class="berita-card berita-card-no-img" onclick="openBeritaDetail('${id}')" style="cursor:pointer">
                  <div class="berita-card-body">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                      <span style="background:${badgeBg};color:${badgeColor};padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600">${badgeIcon} ${badgeLabel}</span>
                      <span style="font-size:0.75rem;color:var(--text-muted)"><i class="fas fa-clock"></i> ${tgl}</span>
                    </div>
                    <div style="font-size:1rem;font-weight:700;margin-bottom:6px;line-height:1.4">${b.judul}</div>
                    <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.5">${shortIsi}</div>
                  </div>
                </div>`;
            }
          });

          container.innerHTML = html;
        });
    } catch (error) {
      console.error('[Berita] listenBerita error:', error);
    }
  },

  openDetail: function(id) {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection('berita').doc(id).get().then(doc => {
        if (!doc.exists) return;
        const b = doc.data();
        const tgl = b.createdAt ? new Date(b.createdAt.toDate()).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '';
        const isPengumuman = b.kategori === 'pengumuman';
        const badgeColor = isPengumuman ? '#F59E0B' : '#E31E25';
        const badgeBg = isPengumuman ? '#FEF3C7' : '#FEE2E2';
        const badgeLabel = isPengumuman ? '📢 Pengumuman' : '📰 Berita';

        const modal = document.getElementById('beritaDetailModal');
        if (!modal) return;

        modal.innerHTML = `
          <div class="modal-overlay" onclick="closeBeritaDetail()" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px">
            <div class="modal-content" onclick="event.stopPropagation()" style="background:var(--card);border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
              ${b.foto ? `<img src="${b.foto}" style="width:100%;height:250px;object-fit:cover;border-radius:16px 16px 0 0" onerror="this.style.display='none'">` : ''}
              <div style="padding:24px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
                  <span style="background:${badgeBg};color:${badgeColor};padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600">${badgeLabel}</span>
                  <span style="font-size:0.8rem;color:var(--text-muted)"><i class="fas fa-clock"></i> ${tgl}</span>
                </div>
                <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:16px;line-height:1.4">${b.judul}</h2>
                <div style="font-size:0.95rem;color:var(--text);line-height:1.8;white-space:pre-wrap">${b.isi}</div>
                <div style="margin-top:24px;text-align:right">
                  <button onclick="closeBeritaDetail()" style="background:var(--bg);color:var(--text-muted);border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.9rem">Tutup</button>
                </div>
              </div>
            </div>
          </div>`;

        modal.style.display = 'block';
      });
    } catch (error) {
      console.error('[Berita] openDetail error:', error);
    }
  },

  closeDetail: function() {
    const modal = document.getElementById('beritaDetailModal');
    if (modal) modal.style.display = 'none';
  }
};

// ==========================================
// MAP MODULE
// ==========================================
const Map = {
  isListening: false,

  init: function() {},

  initMap: function() {
    try {
      const existingMap = App.safeRun('Globals', 'get', 'map');
      if (existingMap) return;

      const map = L.map('dash-peta').setView([0.99, 102.7], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      App.safeRun('Globals', 'set', 'map', map);
    } catch (error) {
      console.error('[Map] initMap error:', error);
    }
  },

  getUserIcon: function(isMe) {
    return L.divIcon({
      className: '',
      html: `<div style="background:${isMe ? '#E31E25' : '#10B981'}; width:20px; height:20px; border-radius:50%; border:2px solid white;"></div>`,
      iconSize: [20, 20]
    });
  },

  updateMyLocation: function(user) {
    try {
      if (!navigator.geolocation) return;
      const self = this;
      navigator.geolocation.watchPosition(pos => {
        const currentUserData = App.safeRun('Globals', 'get', 'currentUserData');
        self.updateMyPresence(user.uid, currentUserData?.nama || "Kader", pos.coords.latitude, pos.coords.longitude);
      }, err => {}, { enableHighAccuracy: true });
    } catch (error) {
      console.error('[Map] updateMyLocation error:', error);
    }
  },

  updateMyPresence: function(uid, nama, lat, lng) {
    try {
      if (!lat || !lng) return;
      const db = App.safeRun('Firebase', 'getDb');
      db.collection('presence').doc(uid).set({ lat, lng, lastSeen: new Date(), nama }, { merge: true });
    } catch (error) {
      console.error('[Map] updateMyPresence error:', error);
    }
  },

  listenToOtherUsers: function() {
    try {
      if (this.isListening) return;
      this.isListening = true;

      const db = App.safeRun('Firebase', 'getDb');
      const auth = App.safeRun('Firebase', 'getAuth');
      const map = App.safeRun('Globals', 'get', 'map');
      let mapMarkers = App.safeRun('Globals', 'get', 'mapMarkers') || {};

      if (!map) return;

      const self = this;
      db.collection('presence').onSnapshot(snap => {
        snap.docChanges().forEach(c => {
          const d = c.doc.data();
          const uid = c.doc.id;
          const isMe = (uid === auth.currentUser.uid);

          if (mapMarkers[uid]) {
            mapMarkers[uid].setLatLng([d.lat, d.lng]);
          } else {
            mapMarkers[uid] = L.marker([d.lat, d.lng], { icon: self.getUserIcon(isMe) }).addTo(map).bindPopup(`<b>${isMe ? 'Anda' : d.nama}</b>`);
          }
        });
        App.safeRun('Globals', 'set', 'mapMarkers', mapMarkers);
      });
    } catch (error) {
      console.error('[Map] listenToOtherUsers error:', error);
    }
  }
};

// ==========================================
// DASHBOARD MODULE
// ==========================================
const Dashboard = {
  init: function() {},

  loadTugasBulanan: async function(userId) {
    try {
      const list = document.getElementById('taskList');
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();

      document.getElementById('bulanInfo').innerText = `${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

      const db = App.safeRun('Firebase', 'getDb');
      const cek = await db.collection('tugas').where('bulan', '==', m).where('tahun', '==', y).limit(1).get();

      if (cek && cek.empty) {
        await db.collection('tugas').doc().set({ nama: "Checkin", tipe: "checkin", poin: 10, bulan: m, tahun: y });
      }

      db.collection('tugas').where('bulan', '==', m).where('tahun', '==', y).onSnapshot(async snap => {
        if (snap.empty) {
          list.innerHTML = '<p style="color:var(--text-muted)">Tidak ada tugas.</p>';
          return;
        }

        const done = await db.collection('task_done').where('userId', '==', userId).get();
        const doneMap = {};
        done.forEach(d => {
          const data = d.data();
          if (!doneMap[data.taskId]) doneMap[data.taskId] = [];
          doneMap[data.taskId].push(data.waktu);
        });

        list.innerHTML = '';
        snap.forEach(doc => {
          const t = doc.data();
          const id = doc.id;
          let isDone = false;

          if (t.tipe === 'checkin') {
            const ts = doneMap[id] || [];
            isDone = ts.some(x => x.toDate().toDateString() === new Date().toDateString());
          } else {
            isDone = doneMap[id] && doneMap[id].length > 0;
          }

          list.innerHTML += `<div class="task-item ${isDone ? 'is-done' : ''}">
            <div style="display:flex;justify-content:space-between">
              <b>${t.nama}</b>
              <span class="badge badge-pending">+${t.poin}</span>
            </div>
            ${t.tipe === 'checkin' ?
              (isDone ? '<button class="btn-disabled" disabled>Selesai</button>' : `<button onclick="checkin('${id}',${t.poin})">Checkin</button>`) :
              (isDone ? '<span class="badge badge-done">Done</span>' : `<button onclick="submitLink('${id}',${t.poin})">Submit</button>`)}
          </div>`;
        });
      });
    } catch (error) {
      console.error('[Dashboard] loadTugasBulanan error:', error);
    }
  },

  submitLink: async function(id, p) {
    try {
      const link = prompt("Link:");
      if (link) {
        const auth = App.safeRun('Firebase', 'getAuth');
        const db = App.safeRun('Firebase', 'getDb');

        await db.collection('task_done').add({ userId: auth.currentUser.uid, taskId: id, bukti: link, waktu: new Date() });
        await db.collection('users').doc(auth.currentUser.uid).update({ poin: firebase.firestore.FieldValue.increment(p) });
        alert("Sukses!");
      }
    } catch (error) {
      console.error('[Dashboard] submitLink error:', error);
    }
  },

  checkin: async function(id, p) {
    try {
      navigator.geolocation.getCurrentPosition(async pos => {
        const auth = App.safeRun('Firebase', 'getAuth');
        const db = App.safeRun('Firebase', 'getDb');

        await db.collection('task_done').add({ userId: auth.currentUser.uid, taskId: id, lat: pos.coords.latitude, lng: pos.coords.longitude, waktu: new Date() });
        await db.collection('users').doc(auth.currentUser.uid).update({ poin: firebase.firestore.FieldValue.increment(p) });
        alert("Sukses!");
      }, () => alert("GPS Error"));
    } catch (error) {
      console.error('[Dashboard] checkin error:', error);
    }
  },

  kirimLaporan: async function() {
    try {
      const txt = document.getElementById('masalah').value;
      if (txt.length < 10) return alert("Terlalu pendek");

      navigator.geolocation.getCurrentPosition(async pos => {
        const auth = App.safeRun('Firebase', 'getAuth');
        const db = App.safeRun('Firebase', 'getDb');
        const currentUserData = App.safeRun('Globals', 'get', 'currentUserData');

        await db.collection("laporan").add({ userId: auth.currentUser.uid, nama: currentUserData.nama, masalah: txt, lat: pos.coords.latitude, lng: pos.coords.longitude, waktu: new Date() });
        await db.collection('users').doc(auth.currentUser.uid).update({ poin: firebase.firestore.FieldValue.increment(10) });
        alert("Terkirim +10 Poin");
      }, () => alert("GPS error"));
    } catch (error) {
      console.error('[Dashboard] kirimLaporan error:', error);
    }
  },

  kirimUsulan: function() {
    try {
      const t = document.getElementById('usulanText').value;
      const n = document.getElementById('usulanNama').value;
      if (!t) return alert("Tulis usulan");

      const db = App.safeRun('Firebase', 'getDb');
      db.collection("usulan").add({ usulan: t, nama: n, tempo: new Date() }).then(() => alert("Usulan terkirim!"));
    } catch (error) {
      console.error('[Dashboard] kirimUsulan error:', error);
    }
  }
};

// ==========================================
// ANALYTICS MODULE
// ==========================================
const Analytics = {
  init: function() {
    this.initAnalytics();
  },

  initAnalytics: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');

      db.collection("users").onSnapshot(snapshot => {
        if (!snapshot.size) return;

        let total = 0;
        const dist = {};

        snapshot.forEach(d => {
          const u = d.data();
          total++;
          let kecName = u.kecamatan || "Belum Lengkap";
          if (!dist[kecName]) dist[kecName] = 0;
          dist[kecName]++;
        });

        document.getElementById('lastUpdate').innerText = new Date().toLocaleTimeString('id-ID');

        const labels = Object.keys(dist);
        const data = Object.values(dist);
        const colors = ['#E31E25', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1'];

        const ctx = document.getElementById('analyticsChart').getContext('2d');
        const existingChart = App.safeRun('Globals', 'get', 'analyticsChart');

        if (existingChart) {
          existingChart.data.labels = labels;
          existingChart.data.datasets[0].data = data;
          existingChart.update();
        } else {
          const chart = new Chart(ctx, {
            type: 'pie',
            data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, hoverOffset: 4 }] },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#64748b', usePointStyle: true, font: { size: 10 } } } }
            }
          });
          App.safeRun('Globals', 'set', 'analyticsChart', chart);
        }

        const tbody = document.getElementById('analyticsTable');
        let tHtml = '';
        const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);

        sorted.forEach(([name, count]) => {
          const percent = ((count / total) * 100).toFixed(1);
          tHtml += `<tr><td>${name}</td><td style="text-align:center"><b>${count}</b></td><td style="text-align:right">${percent}%<div class="percent-bar"><div class="percent-fill" style="width:${percent}%"></div></div></td></tr>`;
        });
        tbody.innerHTML = tHtml;
      });
    } catch (error) {
      console.error('[Analytics] initAnalytics error:', error);
    }
  }
};

// ==========================================
// STORE MODULE
// ==========================================
const Store = {
  init: function() {
    this.loadProduk();
  },

  switchStoreTab: function(tab) {
    try {
      document.querySelectorAll('.store-tab').forEach((el, i) => {
        el.classList.remove('active');
        if ((tab === 'list' && i === 0) || (tab === 'add' && i === 1)) el.classList.add('active');
      });
      document.getElementById('store-list').style.display = tab === 'list' ? 'block' : 'none';
      document.getElementById('store-add').style.display = tab === 'add' ? 'block' : 'none';
    } catch (error) {
      console.error('[Store] switchStoreTab error:', error);
    }
  },

  previewProductPhoto: function(input) {
    try {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('previewPhotoImg').src = e.target.result;
          document.getElementById('previewPhotoContainer').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
      }
    } catch (error) {
      console.error('[Store] previewProductPhoto error:', error);
    }
  },

  tambahProduk: async function() {
    try {
      const nama = document.getElementById('inputNamaProduk').value;
      const harga = parseInt(document.getElementById('inputHargaProduk').value);
      const desc = document.getElementById('inputDescProduk').value;
      const file = document.getElementById('inputFotoProduk').files[0];

      if (!nama || !harga || !desc || !file) return alert("Lengkapi data");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "partai_upload");

      const btn = event.target;
      btn.innerHTML = "Uploading...";
      btn.disabled = true;

      const res = await fetch("https://api.cloudinary.com/v1_1/dpdq2a9us/image/upload", { method: "POST", body: formData });
      const img = await res.json();

      const auth = App.safeRun('Firebase', 'getAuth');
      const db = App.safeRun('Firebase', 'getDb');
      const currentUserData = App.safeRun('Globals', 'get', 'currentUserData');

      await db.collection("produk").add({
        nama: nama,
        harga: harga,
        deskripsi: desc,
        foto: img.secure_url,
        userId: auth.currentUser.uid,
        namaKader: currentUserData.nama,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Sukses!");
      this.switchStoreTab('list');

      btn.innerHTML = "<i class='fas fa-paper-plane'></i> Upload";
      btn.disabled = false;
    } catch (e) {
      console.error('[Store] tambahProduk error:', e);
      alert("Gagal");
    }
  },

  loadProduk: function() {
    try {
      const db = App.safeRun('Firebase', 'getDb');
      db.collection("produk").orderBy("createdAt", "desc").onSnapshot(snap => {
        const g = document.getElementById('productGrid');
        if (snap.empty) {
          g.innerHTML = "<p style='text-align:center;grid-column:span 2'>Kosong</p>";
          return;
        }

        let h = "";
        snap.forEach(d => {
          const p = d.data();
          const t = p.createdAt ? new Date(p.createdAt.toDate()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-';
          h += `<div class="product-card">
            <img src="${p.foto}" class="product-img">
            <div class="product-body">
              <div class="product-name">${p.nama}</div>
              <div class="product-price">Rp ${p.harga.toLocaleString('id-ID')}</div>
              <div class="product-desc">${p.deskripsi}</div>
              <div class="product-seller"><i class="fas fa-user"></i> ${p.namaKader} • ${t}</div>
            </div>
          </div>`;
        });
        g.innerHTML = h;
      });
    } catch (error) {
      console.error('[Store] loadProduk error:', error);
    }
  }
};

// ==========================================
// PROFILE MODULE
// ==========================================
const Profile = {
  init: function() {},

  openEditModal: function() {
    try {
      const currentUserData = App.safeRun('Globals', 'get', 'currentUserData');

      document.getElementById('editNama').value = currentUserData.nama || "";
      document.getElementById('editHp').value = currentUserData.hp || "";
      document.getElementById('previewAvatar').innerHTML = currentUserData.photoURL
        ? `<img src="${currentUserData.photoURL}" style="width:100%;height:100%;object-fit:cover">`
        : `<span>${(currentUserData.nama || 'A').substring(0, 1)}</span>`;

      document.getElementById('editModal').style.display = 'flex';
    } catch (error) {
      console.error('[Profile] openEditModal error:', error);
    }
  },

  closeModal: function() {
    try {
      document.getElementById('editModal').style.display = 'none';
    } catch (error) {
      console.error('[Profile] closeModal error:', error);
    }
  },

  saveProfile: async function() {
    try {
      const nama = document.getElementById('editNama').value;
      const hp = document.getElementById('editHp').value;

      if (!nama) return alert("Nama wajib!");

      const auth = App.safeRun('Firebase', 'getAuth');
      const db = App.safeRun('Firebase', 'getDb');

      await db.collection('users').doc(auth.currentUser.uid).update({ nama, hp });
      alert("Tersimpan!");
      this.closeModal();
    } catch (e) {
      console.error('[Profile] saveProfile error:', e);
      alert("Gagal.");
    }
  }
};

// ==========================================
// REGISTER MODULES
// ==========================================
App.register('Firebase', Firebase);
App.register('Globals', Globals);
App.register('Theme', Theme);
App.register('Wilayah', Wilayah);
App.register('Navigation', Navigation);
App.register('Hero', Hero);
App.register('Auth', Auth);
App.register('Map', Map);
App.register('Dashboard', Dashboard);
App.register('Analytics', Analytics);
App.register('Store', Store);
App.register('Profile', Profile);
App.register('Berita', Berita);

// ==========================================
// GLOBAL WRAPPER FUNCTIONS (HTML Interface)
// ==========================================
function toggleTheme() { App.safeRun('Theme', 'toggleTheme'); }
function showView(id) { App.safeRun('Navigation', 'showView', id); }
function showDashboardSection(sec) { App.safeRun('Navigation', 'showDashboardSection', sec); }
function navigateToDashboard() { App.safeRun('Navigation', 'navigateToDashboard'); }
function openAuthModal() { App.safeRun('Navigation', 'openAuthModal'); }
function closeAuthModal() { App.safeRun('Navigation', 'closeAuthModal'); }
function showReg() { App.safeRun('Navigation', 'showReg'); }
function showLog() { App.safeRun('Navigation', 'showLog'); }
function showResetPassword() { App.safeRun('Navigation', 'showResetPassword'); }
function goToSlide(index) { App.safeRun('Hero', 'goToSlide', index); }

function loadProvinces() { App.safeRun('Wilayah', 'loadProvinces'); }
function loadKabupaten(pid) { App.safeRun('Wilayah', 'loadKabupaten', pid); }
function loadKecamatan(kid) { App.safeRun('Wilayah', 'loadKecamatan', kid); }
function loadDesa(kid) { App.safeRun('Wilayah', 'loadDesa', kid); }

function signup() { App.safeRun('Auth', 'signup'); }
function login() { App.safeRun('Auth', 'login'); }
function resetPassword() { App.safeRun('Auth', 'resetPassword'); }
function logout() { App.safeRun('Auth', 'logout'); }

function openEditModal() { App.safeRun('Profile', 'openEditModal'); }
function closeModal() { App.safeRun('Profile', 'closeModal'); }
function saveProfile() { App.safeRun('Profile', 'saveProfile'); }

function submitLink(id, p) { App.safeRun('Dashboard', 'submitLink', id, p); }
function checkin(id, p) { App.safeRun('Dashboard', 'checkin', id, p); }
function kirimLaporan() { App.safeRun('Dashboard', 'kirimLaporan'); }
function kirimUsulan() { App.safeRun('Dashboard', 'kirimUsulan'); }

function switchStoreTab(tab) { App.safeRun('Store', 'switchStoreTab', tab); }
function previewProductPhoto(input) { App.safeRun('Store', 'previewProductPhoto', input); }
function tambahProduk() { App.safeRun('Store', 'tambahProduk'); }

function openBeritaDetail(id) { App.safeRun('Berita', 'openDetail', id); }
function closeBeritaDetail() { App.safeRun('Berita', 'closeDetail'); }

function kirimKeSheet(type, payload) {
  fetch("https://script.google.com/macros/s/AKfycbx5pk1UiCAl6cszjUhPOYKuIp7HRtih9wXD5gYPwZ0Y7Rc0mOhSdPEYFZ3EgTJ6f3bP/exec", {
    method: "POST",
    body: JSON.stringify({
      type: type,
      payload: payload
    })
  })
  .then(res => res.text())
  .then(res => console.log("Sheet:", res))
  .catch(err => console.error("Error:", err));
}

function showApp() {
  document.getElementById("authScreen").style.display = "none";
}

function showAuth() {
  document.getElementById("authScreen").style.display = "flex";
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
window.onerror = function(message, source, lineno, colno, error) {
  console.error('[Global Error]', { message, source, line: lineno, column: colno, error });
  return false;
};

// ==========================================
// INIT ON LOAD
// ==========================================
window.onload = function() {
  App.init();
  App.safeRun('Wilayah', 'loadProvinces');
};
