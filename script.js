let laporan = [];
let poin = 0;

function kirim() {
  let data = {
    nama: document.getElementById('nama').value,
    lokasi: document.getElementById('lokasi').value,
    masalah: document.getElementById('masalah').value
  };

  laporan.push(data);
  render();
}

function render() {
  let list = document.getElementById('tugas');
  list.innerHTML = '';

  laporan.forEach((l, i) => {
    let li = document.createElement('li');
    li.innerHTML = `
      ${l.nama} - ${l.masalah}
      <button onclick="selesai(${i})">Selesai</button>
    `;
    list.appendChild(li);
  });

  document.getElementById('poin').innerText = poin;

  renderLeaderboard();
}

function selesai(index) {
  poin += 10;
  laporan.splice(index, 1);
  render();
}

function renderLeaderboard() {
  let lb = document.getElementById('leaderboard');
  lb.innerHTML = `
    <li>Kader A - 120 poin</li>
    <li>Kader B - 90 poin</li>
    <li>Kader C - 70 poin</li>
  `;
}
