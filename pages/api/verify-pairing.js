import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { phone, code } = req.body
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' })

  try {
    const sessionPath = path.join('/tmp', `session-${phone}`)
const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false,
      browser: ['NeonSessionGen', 'Chrome', '1.0.0']
    })

    // Verify pairing code entered from phone
    const cleanedPhone = phone.replace(/\+/g, '')
    await sock.verifyPairingCode(cleanedPhone, code)

    // Save session
    saveState()

    // Send session to your WhatsApp DM
    const jid = cleanedPhone + '@s.whatsapp.net'
    await sock.sendMessage(jid, {
      document: { url: sessionPath },
      mimetype: 'application/json',
      fileName: 'session.json'
    })
    await sock.sendMessage(jid, { text: '✅ Session generated successfully!' })

    // Clean up
    fs.unlinkSync(sessionPath)
    sock.end()

    res.status(200).json({ message: 'Session sent successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to verify pairing code', details: err.message })
  }
}
