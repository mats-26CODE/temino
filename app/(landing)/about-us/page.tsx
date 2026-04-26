const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:max-w-3xl">
      <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl">
        About Temino
      </h1>
      <p className="text-muted-foreground mt-4 text-lg">
        Temino is on a mission to make intercity travel in Tanzania simple, transparent, and
        delightful — starting with bus booking, and expanding to flights and beyond.
      </p>

      <div className="prose dark:prose-invert mt-10 max-w-none">
        <h2>Why we built Temino</h2>
        <p>
          Booking a bus ticket today often means hopping between counters, calling friends, and
          hoping the price is right. We think you deserve better — modern booking, side-by-side
          comparisons, and instant confirmation.
        </p>

        <h2>What&apos;s next</h2>
        <p>We&apos;re working on plane tickets, ferries, and more. Stay tuned.</p>
      </div>
    </div>
  );
};

export default AboutUsPage;
