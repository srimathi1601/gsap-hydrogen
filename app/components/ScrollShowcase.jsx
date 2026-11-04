import {useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';

const IMG = 'https://picsum.photos/id/21/800/800';

export function ScrollShowcase() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      // 1. Hero text slide-up (page load-la)
      gsap.from('.hero-line', {
        yPercent: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
      });

      // 2. Product image pin + zoom + rotate
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '.pin-section',
            start: 'top top',
            end: '+=1200',
            scrub: 1,
            pin: true,
          },
        })
        .to('.product-img', {scale: 1.4, rotate: -8})
        .from('.pin-text', {opacity: 0, x: 100}, '<0.3');

      // 3. Horizontal scroll cards
      const track = root.current.querySelector('.h-track');
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.h-section',
          start: 'top top',
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // 4. Features fade-in
      gsap.utils.toArray('.feature').forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {trigger: el, start: 'top 85%'},
        });
      });
    },
    {scope: root},
  );

  return (
    <div ref={root} className="overflow-hidden">
      {/* 1. Hero */}
      <section className="h-screen flex flex-col items-center justify-center text-center bg-black text-white">
        <div className="overflow-hidden">
          <h1 className="hero-line text-6xl font-bold">Move Better.</h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-line text-6xl font-bold">Train Smarter.</h1>
        </div>
        <p className="hero-line mt-6 opacity-70">Scroll pannunga ↓</p>
      </section>

      {/* 2. Pinned product */}
      <section className="pin-section h-screen flex items-center justify-center gap-16 bg-neutral-100">
        <img className="product-img w-80 rounded-2xl shadow-2xl" src={IMG} alt="Product" />
        <div className="pin-text max-w-sm">
          <h2 className="text-4xl font-bold">Built for performance</h2>
          <p className="mt-4 text-lg opacity-70">
            Scroll panna image zoom + rotate aagum, indha text slide-in aagum.
          </p>
        </div>
      </section>

      {/* 3. Horizontal cards */}
      <section className="h-section h-screen flex items-center bg-white">
        <div className="h-track flex gap-8 px-[10vw]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="shrink-0 w-[60vw] md:w-[30vw] h-[60vh] rounded-3xl bg-neutral-900 text-white p-8 flex items-end text-3xl font-bold"
            >
              Card {n}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Features */}
      <section className="py-[20vh] px-6 max-w-3xl mx-auto space-y-24">
        {['Premium quality', 'Free shipping', 'Easy returns'].map((f) => (
          <h2 key={f} className="feature text-5xl font-bold text-center">{f}</h2>
        ))}
      </section>
    </div>
  );
}