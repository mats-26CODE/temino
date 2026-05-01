"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import {
  partyFormSchema,
  type PartyFormValues,
  type PassengerDetailsFormValues,
  passengerFormToPassengerInfo,
} from "@/lib/passenger-forms";
import { PassengerTravellerFields } from "@/components/shared/passenger-traveller-fields";

export type PassengerPartyCardProps = {
  formId: string;
  partyCount: number;
  initialTravellers: PassengerDetailsFormValues[];
  onSubmitParty: (party: PassengerInfo[]) => void;
};

export const PassengerPartyCard = ({
  formId,
  partyCount,
  initialTravellers,
  onSubmitParty,
}: PassengerPartyCardProps) => {
  const { t } = useTranslation();

  const resolver = useMemo(
    () => zodResolver(partyFormSchema(partyCount)),
    [partyCount],
  );

  const form = useForm<PartyFormValues>({
    resolver,
    defaultValues: { travellers: initialTravellers },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    reset({ travellers: initialTravellers });
  }, [initialTravellers, reset]);

  const onSubmit = (data: PartyFormValues) => {
    onSubmitParty(data.travellers.map(passengerFormToPassengerInfo));
  };

  const tabIds = useMemo(
    () => Array.from({ length: partyCount }, (_, i) => String(i)),
    [partyCount],
  );

  return (
    <FormProvider {...form}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">
            {t("passenger.title")}
          </CardTitle>
          <CardDescription>
            {partyCount > 1 ? t("passenger.subtitleParty") : t("passenger.subtitle")}
          </CardDescription>
        </CardHeader>

        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 pb-6">
          {partyCount <= 1 ? (
            <PassengerTravellerFields travellerIndex={0} />
          ) : (
            <Tabs defaultValue="0" className="w-full gap-6 px-6">
              <div className="-mx-1 overflow-x-auto overflow-y-hidden pb-1 px-1 [-webkit-overflow-scrolling:touch]">
                <TabsList
                  variant="default"
                  className="inline-flex h-auto min-h-11 min-w-max max-w-none shrink-0 flex-nowrap gap-1.5 rounded-xl bg-muted p-1 ring-1 ring-border/60"
                >
                  {tabIds.map((id, i) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      type="button"
                      className="max-w-none shrink-0 px-4 text-xs shadow-none ring-offset-background sm:text-sm"
                    >
                      <span className="whitespace-nowrap">
                        {t("passenger.travellerTab", { n: i + 1 })}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabIds.map((id, i) => (
                <TabsContent key={id} value={id} className="mt-0 pb-2 focus-visible:outline-none">
                  <PassengerTravellerFields travellerIndex={i} embedded />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </form>
      </Card>
    </FormProvider>
  );
};
