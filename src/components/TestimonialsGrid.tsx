const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-dark-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const testimonials = [
  {
    rating: 5,
    quote: 'Caleb and team did an excellent job at removing all the stuff from my duplex. It was a major overhaul from an eviction unit. So thankful for their quick and speedy help. Would highly recommend for any major cleanup needs.',
    author: 'Sharene May',
  },
  {
    rating: 5,
    quote: "Lake City Hauling made everything so easy for me. Caleb is a great guy and helped me make the best out of the situation I was in. They are so convenient. They have the best prices around and i couldn't thank them enough. I will definitely be coming back next time and let everyone know what a great company you guys run. I appreciate you!",
    author: 'Brady Coker',
  },
  {
    rating: 5,
    quote: "Lake city Hauling is the only hauling company I'll use. They did a great job communicating and taking care of me on such short notice. The prices are also way more reasonable than the other companies in the area. Would definitely recommend!!",
    author: 'Makaila Wallace',
  },
  {
    rating: 5,
    quote: 'Lake City Hauling did an amazing job. We hired them for a two day job and it only took one. They were so friendly, fast at work, professional. The cost was so reasonable, and I would use them again and again if I needed them. Call and ask for Caleb.',
    author: 'Lee Metcalf',
  },
  {
    rating: 5,
    quote: 'Lake City Hauling & Caleb were amazing! I contacted couple different folks and they were the best. Customer service was excellent, was even able to provide me a second dumpster the day of and this was out in Harrison, ID. The service was on time, easy to work with, communicated great. And the price was what he said it was. Big Thanks!',
    author: 'Brason Alexander',
  },
  {
    rating: 5,
    quote: 'They hauled off a massive mess we made tearing down a wall. They were very quick and did a wonderful job. Very simple and transparent pricing! Will certainly be using them any time I\'ve got stuff to get rid of.',
    author: 'Dexter Monroe',
  },
];

export default function TestimonialsGrid() {
  return (
    <div id="reviews" className="py-24 section-bg-primary relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-500/5 to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-50" style={{ background: 'linear-gradient(to top right, var(--section-bg-secondary, var(--color-dark-900)), transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block section-text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold section-text-primary mb-6">
            Trusted By{' '}
            <span className="text-primary-500">
              Your Neighbors
            </span>
          </h2>
          <p className="section-text-secondary text-lg max-w-2xl mx-auto">
            See why homeowners consistently love our fast response, fair pricing, and spotless results.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="group section-bg-secondary rounded-2xl p-6 section-border border hover:border-opacity-70 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= testimonial.rating} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6">
                <p className="section-text-secondary leading-relaxed text-sm" style={{ color: 'var(--section-text-secondary, var(--color-gray-300))' }}>
                  "{testimonial.quote}"
                </p>
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 section-border border-t">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold section-text-primary text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="section-text-secondary text-xs opacity-70">
                    Verified Customer
                  </p>
                </div>
              </div>

              {/* Google Badge */}
              <div className="mt-4 flex items-center gap-1.5 section-text-secondary text-xs opacity-70">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Review
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="tel:2089980054"
            className="inline-flex items-center gap-3 btn-section px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call To Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
