"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import {
  PassengerDetailsForm,
  type PassengerDetailsFormValues,
  PASSENGER_ID_TYPES,
  type PassengerIdType,
} from "@/components/shared/passenger-details-form";

export { PASSENGER_ID_TYPES };
export type { PassengerDetailsFormValues, PassengerIdType };

export type PassengerDetailsCardProps = {
  formId: string;
  defaultValues: PassengerDetailsFormValues;
  onValidSubmit: (data: PassengerDetailsFormValues) => void;
};

export const PassengerDetailsCard = ({
  formId,
  defaultValues,
  onValidSubmit,
}: PassengerDetailsCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">{t("passenger.title")}</CardTitle>
        <CardDescription>{t("passenger.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <PassengerDetailsForm
          formId={formId}
          defaultValues={defaultValues}
          onValidSubmit={onValidSubmit}
        />
      </CardContent>
    </Card>
  );
};
