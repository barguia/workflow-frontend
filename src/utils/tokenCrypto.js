// src/utils/tokenCrypto.js
// Criptografia AES-GCM (Web Crypto API) do token de auth persistido no localStorage.
// A chave é derivada via SHA-256 de uma string configurável — não é uma barreira real
// contra XSS (a chave vai no bundle), só evita guardar o token em texto puro no storage.

async function getKey(secret) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptToken(token, secret) {
  const key = await getKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token))

  const combined = new Uint8Array(iv.length + cipher.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(cipher), iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptToken(encrypted, secret) {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const key = await getKey(secret)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

  return new TextDecoder().decode(plain)
}
