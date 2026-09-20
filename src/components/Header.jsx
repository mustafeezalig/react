import { Link } from 'react-router-dom'

function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[auto_1fr] items-center border-b-[3px] border-[#e9b872] bg-[#102a2e] px-[clamp(24px,7vw,96px)] py-[22px] shadow-[0_8px_24px_rgba(16,42,46,0.18)] max-[520px]:grid-cols-1 max-[520px]:justify-items-center max-[520px]:gap-4 max-[520px]:px-5 max-[520px]:py-[18px] max-[520px]:text-center">
      <Link className="flex items-center gap-2.5 text-[1.4rem] font-bold tracking-[0.08em] text-[#f4c879] no-underline" to="/"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#b8e95d] text-sm tracking-normal text-[#172337]">Z</span>Zions</Link>
      <nav className="grid grid-flow-col items-center justify-end gap-7 rounded-full border border-white/10 bg-white/5 px-3 py-2 max-[520px]:grid-cols-2 max-[520px]:grid-flow-row max-[520px]:justify-center max-[520px]:gap-x-[18px] max-[520px]:gap-y-3 max-[520px]:rounded-2xl" aria-label="Main navigation">
        <Link className="text-[0.95rem] text-[#f8f3eb] no-underline transition-colors hover:text-[#f4c879] focus-visible:text-[#f4c879]" to="/">Home</Link>
        {user && <Link className="text-[0.95rem] text-[#f8f3eb] no-underline transition-colors hover:text-[#f4c879] focus-visible:text-[#f4c879]" to="/data">User List</Link>}
        {user && <Link className="text-[0.95rem] text-[#f8f3eb] no-underline transition-colors hover:text-[#f4c879] focus-visible:text-[#f4c879]" to="/app-user">App-User</Link>}
        {user ? (
          <>
            <span className="text-[0.9rem] text-[#f4c879] max-[520px]:col-span-full max-[520px]:row-start-2">Hi, {user.username}</span>
            <button className="rounded-full border border-[#e9b872] bg-transparent px-[17px] py-2 text-[#f8f3eb] transition-colors hover:text-[#f4c879] focus-visible:text-[#f4c879]" type="button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="rounded-full border border-[#e9b872] px-[17px] py-2 text-[#f8f3eb] no-underline transition-colors hover:text-[#f4c879] focus-visible:text-[#f4c879]" to="/login">Login</Link>
            <Link className="rounded-full bg-[#b8e95d] px-[17px] py-2 font-bold text-[#172337] no-underline transition-colors hover:bg-[#d2f58b] focus-visible:bg-[#d2f58b]" to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
