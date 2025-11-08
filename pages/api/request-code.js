import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import path from 'path'

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body;

  // Validate input
  if (!phone)
    return res.status(400).json({ error: 'Phone number required' });

  try {
    // Create a temp folder for session
    const sessionPath = path.join('/tmp', `session-${phone}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // Initialize WhatsApp socket
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['NeonSessionGen', 'Chrome', '1.0.0'],
    });

    // Clean phone number (remove +)
    const cleanedPhone = phone.replace(/\+/g, '');

    // Request WhatsApp pairing code
    const pairingCode = await sock.requestPairingCode(cleanedPhone);

    // Auto-save creds when updated
    sock.ev.on('creds.update', saveCreds);

    // Send code back to frontend
    res.status(200).json({
      message: 'Pairing code generated successfully',
      pairingCode,
    });

  } catch (err) {
    console.error('Error generating pairing code:', err);
    res.status(500).json({
      error: 'Failed to request pairing code',
      details: err.message,
    });
  }
}
