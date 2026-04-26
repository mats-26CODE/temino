import { Card } from "@/components/ui/card";
import { CONTACT_US_PHONE, SUPPORT_EMAIL } from "@/constants/values";

const SupportPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:max-w-3xl">
      <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl">
        Support
      </h1>
      <p className="text-muted-foreground mt-4 text-lg">
        Need help with a booking? We&apos;re here for you.
      </p>

      <Card className="mt-10 grid gap-4 rounded-2xl p-6 md:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-sm">Email</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary text-lg font-semibold">
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Phone</p>
          <a
            href={`tel:${CONTACT_US_PHONE.replaceAll(" ", "")}`}
            className="text-primary text-lg font-semibold"
          >
            {CONTACT_US_PHONE}
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SupportPage;
