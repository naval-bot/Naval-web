import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Phone number required' })

  try {
    const sessionPath = path.join('/tmp', `session-${phone}`)
const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false
      browser: ['NeonSessionGen', 'Chrome', '1.0.0']
    })

    // Request pairing code to phone
    const cleanedPhone = phone.replace(/\+/g, '')
    const pairingCode = await sock.requestPairingCode(cleanedPhone)

    // Auto-save credentials
    sock.ev.on('creds.update', saveState)

    res.status(200).json({ message: 'Pairing code sent to your WhatsApp', pairingCode })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to request pairing code', details: err.message })
  }
}
