const form = document.querySelector('#vault-form');
const keyInput = document.querySelector('#vault-key');
const status = document.querySelector('#vault-status');
const encoder = new TextEncoder();

const deriveKey = (passphrase, salt) => crypto.subtle.importKey(
  'raw',
  encoder.encode(passphrase),
  'PBKDF2',
  false,
  ['deriveKey']
).then(material => crypto.subtle.deriveKey(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 250000 },
  material,
  { name: 'AES-GCM', length: 256 },
  false,
  ['decrypt']
));

form?.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = 'VERIFYING ACCESS…';

  try {
    const response = await fetch('archive-file.enc', { cache: 'no-store' });
    if (!response.ok) throw new Error('missing-file');

    const payload = new Uint8Array(await response.arrayBuffer());
    const magic = new TextDecoder().decode(payload.slice(0, 8));
    if (magic !== 'ARCVLT01') throw new Error('invalid-file');

    const salt = payload.slice(8, 24);
    const iv = payload.slice(24, 36);
    const encrypted = payload.slice(36);
    const key = await deriveKey(keyInput.value, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      encrypted
    );

    const file = new Blob([decrypted], { type: 'application/pdf' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Archivist_Professional_File.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'ACCESS GRANTED. FILE DECRYPTED LOCALLY.';
    keyInput.value = '';
  } catch {
    status.textContent = 'ACCESS DENIED. VERIFY THE PHRASE AND TRY AGAIN.';
    keyInput.select();
  }
});
