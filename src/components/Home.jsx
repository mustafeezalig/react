import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="overflow-hidden bg-[#f7f3ed]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] items-center gap-[clamp(40px,7vw,110px)] px-6 py-[clamp(64px,10vw,132px)] max-[800px]:grid-cols-1 max-[800px]:gap-12 max-[520px]:px-5 max-[520px]:py-14">
        <div className="relative z-[1]">
          <p className="mb-6 inline-flex items-center gap-2 text-[0.76rem] font-bold uppercase tracking-[0.18em] text-[#b36b3d] before:h-2 before:w-2 before:rounded-full before:bg-[#c56f39] before:content-['']">Welcome to Zions</p>
          <h1 className="m-0 max-w-[680px] font-serif text-[clamp(3.6rem,8vw,7.8rem)] leading-[0.88] tracking-[-0.03em] text-[#16363a]">A clearer way to <em className="text-[#c56f39]">move</em> forward.</h1>
          <p className="mt-8 max-w-[490px] text-[1.05rem] leading-7 text-[#65706d]">A calmer home for your financial life. Keep your people, plans, and progress moving in the same direction.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link className="rounded-full bg-[#16363a] px-6 py-3.5 font-bold text-[#f8f3eb] no-underline shadow-[0_10px_20px_rgba(22,54,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b36b3d]" to="/signup">Open your account <span aria-hidden="true">&#8594;</span></Link>
            <Link className="rounded-full border border-[#c9bda9] px-6 py-3.5 font-bold text-[#16363a] no-underline transition hover:border-[#16363a] hover:bg-[#fffaf2]" to="/login">Sign in</Link>
          </div>
          <div className="mt-16 grid max-w-[510px] grid-cols-3 border-t border-[#d9cec0] pt-5 max-[520px]:mt-12 max-[420px]:grid-cols-1 max-[420px]:gap-5">
            <div><strong className="block font-serif text-3xl text-[#16363a]">24/7</strong><span className="text-[0.76rem] uppercase tracking-[0.1em] text-[#65706d]">Access</span></div>
            <div><strong className="block font-serif text-3xl text-[#16363a]">4.9<span className="text-lg text-[#c56f39]">/5</span></strong><span className="text-[0.76rem] uppercase tracking-[0.1em] text-[#65706d]">Member rating</span></div>
            <div><strong className="block font-serif text-3xl text-[#16363a]">100%</strong><span className="text-[0.76rem] uppercase tracking-[0.1em] text-[#65706d]">Human support</span></div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border-[22px] border-[#e9b872]/40 max-[520px]:-right-5 max-[520px]:-top-5" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[28px] bg-[#102a2e] p-3 shadow-[0_28px_60px_rgba(16,42,46,0.22)]">
            <img className="block aspect-[0.88] w-full rounded-[20px] object-cover opacity-90" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85" alt="Modern glass bank building in a city" />
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between rounded-2xl border border-white/20 bg-[#102a2e]/90 p-5 text-[#f8f3eb] backdrop-blur-sm">
              <div><span className="block text-[0.7rem] uppercase tracking-[0.15em] text-[#b8e95d]">Your next chapter</span><strong className="mt-1 block font-serif text-2xl">Starts here.</strong></div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#b8e95d] text-xl text-[#172337]" aria-hidden="true">&#8599;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
