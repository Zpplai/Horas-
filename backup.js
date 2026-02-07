document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnBackup');
  if (!btn) return;

  btn.addEventListener('click', fazerBackup);
});

async function fazerBackup() {
  const dados = JSON.stringify(localStorage, null, 2);

  // fallback se o navegador não suportar
  if (!window.showSaveFilePicker) {
    const blob = new Blob([dados], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup.json';
    a.click();
    return;
  }

  const handle = await showSaveFilePicker({
    suggestedName: 'backup.json',
    types: [{
      description: 'JSON',
      accept: { 'application/json': ['.json'] }
    }]
  });

  const writable = await handle.createWritable();
  await writable.write(dados);
  await writable.close();
}