import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Phone required' })

  try {
    const cleanedPhone = phone.replace(/\+/g, '')
    const sessionPath = path.join('/tmp', `session-${cleanedPhone}`)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['NeonSessionGen', 'Chrome', '1.0.0'],
    })

    sock.ev.on('creds.update', saveCreds)

    // Wait for the connection to open and pairing code to be generated
    const pairingCode = await sock.requestPairingCode(cleanedPhone)

    res.status(200).json({
      message: 'Enter this code in your WhatsApp: Linked Devices → Link with phone number',
      pairingCode,
    })

    // After user enters the code, Baileys connects automatically
    sock.ev.on('connection.update', async (update) => {
      const { connection } = update
      if (connection === 'open') {
        const jid = cleanedPhone + '@s.whatsapp.net'

        // Send the session file back to your WhatsApp
        await sock.sendMessage(jid, {
          document: { url: sessionPath },
          mimetype: 'application/json',
          fileName: 'session.json',
        })

        await sock.sendMessage(jid, { text: '✅ Session generated successfully!' })

        // Clean up
        fs.rmSync(sessionPath, { recursive: true, force: true })
        sock.end()
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate pairing code', details: err.message })
  }
}
