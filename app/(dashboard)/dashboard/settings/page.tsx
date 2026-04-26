"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useLogout } from "@/hooks/use-auth";

const SettingsPage = () => {
  const logout = useLogout();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Customize your experience.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">Theme</p>
              <p className="text-muted-foreground text-xs">Light or dark.</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">Language</p>
              <p className="text-muted-foreground text-xs">English or Kiswahili.</p>
            </div>
            <LanguageToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
