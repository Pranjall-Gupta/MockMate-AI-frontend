const SocialProof = () => {
  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Stripe",
    "Uber",
  ];

  return (
    <section className="py-16 overflow-hidden border-y border-border/30">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <p className="text-center text-sm text-muted-foreground/50 tracking-widest uppercase">
          Candidates placed at
        </p>
      </div>

      <div className="relative">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling Ticker */}
        <div className="flex animate-marquee">
          {[...companies, ...companies].map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-12 text-2xl md:text-3xl font-serif font-medium text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-300"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
