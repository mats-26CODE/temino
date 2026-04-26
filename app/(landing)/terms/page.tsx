const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:max-w-3xl">
      <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl">
        Terms of Service
      </h1>
      <p className="text-muted-foreground mt-4">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose dark:prose-invert mt-8 max-w-none">
        <p>Welcome to Temino. By using our service you agree to these terms.</p>
        <h2>1. Bookings</h2>
        <p>Bookings are confirmed only after successful payment.</p>
        <h2>2. Refunds</h2>
        <p>Refund policies vary by operator. Please check at checkout.</p>
      </div>
    </div>
  );
};

export default TermsPage;
