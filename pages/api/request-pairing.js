import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Phone number required' })

  try {
    const cleanedPhone = phone.replace(/\+/g, '')
    const sessionPath = path.join('/tmp', `session-${cleanedPhone}`)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['NeonSessionGen', 'Chrome', '1.0.0'],
    })

    // Auto-save credentials
    sock.ev.on('creds.update', saveCreds)

    // Wait until socket connects
    await new Promise((resolve, reject) => {
      sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') resolve()
        else if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut
          if (!shouldReconnect) reject(new Error('Connection closed'))
        }
      })
    })

    // Request pairing code after connection
    const pairingCode = await sock.requestPairingCode(cleanedPhone)

    res.status(200).json({
      message: 'Pairing code generated successfully',
      pairingCode,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Failed to request pairing code',
      details: err.message,
    })
  }
}
