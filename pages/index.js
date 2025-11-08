import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: 'black', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>WhatsApp Session Generator</h1>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/session">
          <button style={{ padding: '1rem 2rem', fontSize: '1rem', cursor: 'pointer' }}>
            Generate Session File
          </button>
        </Link>
      </div>
    </div>
  );
}
