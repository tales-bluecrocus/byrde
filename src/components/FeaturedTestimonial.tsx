const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-dark-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function FeaturedTestimonial() {
  return (
    <div className="py-20 section-bg-primary relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Quote Pattern */}
      <div className="absolute top-10 left-10 opacity-5">
        <svg className="w-40 h-40 section-text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <div className="absolute bottom-10 right-10 opacity-5 rotate-180">
        <svg className="w-40 h-40 section-text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-8 text-center">
        {/* Section Label */}
        <div className="inline-flex items-center gap-2 section-bg-secondary backdrop-blur-sm section-text-accent px-4 py-2 rounded-full text-sm font-medium mb-8 section-border border">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Featured Review
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="mb-10">
          <p className="font-[var(--font-display)] text-xl sm:text-2xl lg:text-3xl section-text-primary leading-relaxed font-medium">
            "Great bunch of hard working guys. I had a 100 year old shed that had a roof which fell in 30 years ago. It was full of unknown junk. The gave me a fair quote. They showed up the next day and he and his team leveled the shed. They loaded up everything and charged me what we had agreed to. I was gonna do it, but it was a mess. I could not have done it myself. I will use them again."
          </p>
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {/* Avatar Ring */}
            <div className="absolute -inset-1 bg-primary-500 rounded-full" />
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 section-bg-tertiary flex items-center justify-center" style={{ borderColor: 'var(--section-bg-primary, var(--color-dark-900))' }}>
              <span className="text-2xl font-bold section-text-primary">JS</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="section-text-primary font-semibold text-lg">Joshua Smith</h3>
            <p className="section-text-secondary text-sm">Verified Customer</p>
          </div>

          {/* Google Badge */}
          <div className="flex items-center gap-2 mt-4 section-bg-secondary backdrop-blur-sm px-4 py-2 rounded-full section-border border">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="section-text-primary text-sm font-medium">Verified Google Review</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <a
            href="tel:2089980054"
            className="inline-flex items-center gap-2 sm:gap-3 btn-themed px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="whitespace-nowrap">Call For Reliable Junk Removal</span>
          </a>
        </div>
      </div>
    </div>
  );
}
