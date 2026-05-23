import Link from 'next/link'

export default function Home(){return <main className="page"><section className="shell center"><div className="bubble">🥤🫧🍒</div><h1 className="brand">Blindegust</h1><p className="tag">Le jeu de dégustation de sodas à l’aveugle</p><div className="card"><Link className="btn pink" href="/host">Créer une partie</Link><p className="muted">Les joueurs rejoignent ensuite depuis leur téléphone avec un code.</p></div></section></main>}
