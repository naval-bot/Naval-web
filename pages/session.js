import { useState } from 'react';

export default function Session() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitPhone = async () => {
    if (!phone) return alert('Enter phone number!');
    // strip "+" if exists
    const cleanedPhone = phone.startsWith('+') ? phone.slice(1) : phone;

    try {
      const res = await fetch('/api/request-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone })
      });
      const data = await res.json();
      setMessage(data.message || 'Pairing code sent!');
    } catch (err) {
      console.error(err);
      setMessage('Error sending pairing code');
    }
  };

  const handleSubmitCode = async () => {
    if (!phone || !code) return alert('Enter phone and code!');
    const cleanedPhone = phone.startsWith('+') ? phone.slice(1) : phone;

    try {
      const res = await fetch('/api/verify-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone, code })
      });
      const data = await res.json();
      setMessage(data.message || 'Session generated and sent!');
    } catch (err) {
      console.error(err);
      setMessage('Error verifying code');
    }
  };

  return (
    <div style={{ background: 'black', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h1>Generate WhatsApp Session</h1>

      <input 
        type="text" 
        placeholder="Enter phone number with country code" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }} 
      />
      <button onClick={handleSubmitPhone} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Request Pairing Code
      </button>

      <input 
        type="text" 
        placeholder="Enter pairing code" 
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
        style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }} 
      />
      <button onClick={handleSubmitCode} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Generate Session
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
