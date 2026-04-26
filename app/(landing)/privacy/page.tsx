const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:max-w-3xl">
      <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl">
        Privacy Policy
      </h1>
      <p className="text-muted-foreground mt-4">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose dark:prose-invert mt-8 max-w-none">
        <p>
          Temino respects your privacy. This page explains what data we collect and how we use it.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
