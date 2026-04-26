"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-auth";

const ProfilePage = () => {
  const { user } = useUser();
  const initials = (user?.full_name ?? user?.phone ?? "T")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your personal info.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {user?.avatar_url ? <AvatarImage src={user.avatar_url} /> : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" disabled>
              Upload (soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={user?.full_name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={user?.phone ?? ""} disabled />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button disabled>Save changes (soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
