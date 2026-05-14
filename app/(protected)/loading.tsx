export default function ProtectedLoading() {
  return (
    <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#00e5ff',
            boxShadow: '0 0 16px #00e5ff',
            animation: 'pulse 1s ease-in-out infinite',
          }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }`}</style>
          <span style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#1a3050', letterSpacing: 3 }}>LOADING…</span>
        </div>
      </div>
    </main>
  )
}