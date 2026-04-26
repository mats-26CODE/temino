"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants/values";
import Logo from "./logo";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background border-t">
      <div className="container mx-auto px-4 py-10 md:max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Logo size="sm" />
            <p className="text-muted-foreground max-w-xs text-sm">
              {APP_NAME} — modern bus booking for Tanzania. Compare operators, pick your seat, pay
              with mobile money.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold uppercase">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#recommendations"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("nav.recommendations")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about-us" className="text-muted-foreground hover:text-foreground">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground">
                  {t("footer.helpCenter")}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold uppercase">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  {t("footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-10 border-t pt-6 text-center text-xs">
          {t("footer.copyright", { year })}
        </div>
      </div>
    </footer>
  );
};
