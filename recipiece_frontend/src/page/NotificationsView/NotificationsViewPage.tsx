import { FC, useCallback, useState } from "react";
import { useListNotificationsQuery, useSetNotificationStatusMutation } from "../../api";
import { ListNotificationsQuerySchema } from "@recipiece/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, H2, LoadingGroup, Stack } from "../../component";

export const NotificationsViewPage: FC = () => {
  const [filters, setFilters] = useState<ListNotificationsQuerySchema>({
    page_number: 0,
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useListNotificationsQuery({ ...filters });
  const { mutateAsync: setNotificationStatus } = useSetNotificationStatusMutation();

  const onAccordionItemToggled = useCallback((values: string[]) => {}, []);

  return (
    <Stack>
      <H2>Notifications</H2>
      <LoadingGroup isLoading={isLoadingNotifications} variant="spinner" className="h-8 w-8">
        <Accordion type="multiple" onValueChange={onAccordionItemToggled}>
          {(notifications?.data ?? []).length === 0 && <p className="text-center">Your kitchen&apos;s all clean!</p>}
          {(notifications?.data ?? []).map((notification) => {
            return (
              <AccordionItem key={notification.id} value={`${notification.id}`}>
                <AccordionTrigger></AccordionTrigger>
                <AccordionContent>{notification.content}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </LoadingGroup>
    </Stack>
  );
};
