import { useTranslation } from "react-i18next";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type UnitFormValues = {
  uniteGroupID: string;
  userID: string;
  unitTypeID: string;
  number: string;
  description: string;
  notes: string;
  processingCost: number;
  location: {
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  baseUnit: string;
  unitMedia: string[];
  favorite: boolean;
  unitStatus: "available" | "reserved" | "under_maintenance";
};

export default function CreateNewUnit() {
  const { t } = useTranslation("app-sidebar");

  const form = useForm<UnitFormValues>({
    defaultValues: {
      uniteGroupID: "",
      userID: "",
      unitTypeID: "",
      number: "",
      description: "",
      notes: "",
      processingCost: 0,
      location: {
        address: "",
        city: "",
        country: "",
        latitude: undefined,
        longitude: undefined,
      },
      baseUnit: "meter",
      unitMedia: [],
      unitStatus: "available",
    },
  });

  const [open, setOpen] = useState(false);

  // Fetch unit groups and types
  const { data: unitGroups = [] } = useApiQuery<any[]>({
    queryKey: ["unitGroups"],
    endpoint: "/data/unitGroups.json",
    useLocalJson: true,
  });
  const { data: unitTypes = [] } = useApiQuery<any[]>({
    queryKey: ["unitTypes"],
    endpoint: "/data/unitTypes.json",
    useLocalJson: true,
  });

  const createUnitMutation = useApiMutation({
    method: "post",
    endpoint: "/units",
    options: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating unit:", error);
      },
    },
  });

  const onSubmit = (data: UnitFormValues) => {
    createUnitMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip={t("CreateNewUnit")}
          className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
        >
          <IconCirclePlusFilled />
          <span>{t("unit.CreateNewUnit")}</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("unit.CreateNewUnit")}</DialogTitle>
          <DialogDescription>{t("unit.FillUnitForm")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="uniteGroupID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.UnitGroup")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("unit.SelectUnitGroup")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitGroups.map((group) => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitTypeID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.UnitType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("unit.SelectUnitType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.UnitNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("unit.EnterUnitNumber")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.Description")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("unit.EnterDescription")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.Notes")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("unit.AdditionalNotes")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="processingCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.ProcessingCost")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.BaseUnit")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("unit.EnterBaseUnit")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unit.UnitStatus")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("unit.SelectUnitStatus")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">
                          {t("unit.Available")}
                        </SelectItem>
                        <SelectItem value="reserved">
                          {t("unit.Reserved")}
                        </SelectItem>
                        <SelectItem value="under_maintenance">
                          {t("unit.UnderMaintenance")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormLabel>{t("unit.Location")}</FormLabel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit.Address")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("unit.EnterAddress")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit.City")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("unit.EnterCity")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit.Country")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("unit.EnterCountry")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit.Latitude")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("unit.EnterLatitude")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit.Longitude")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("unit.EnterLongitude")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createUnitMutation.isPending}>
                {createUnitMutation.isPending
                  ? t("unit.Creating")
                  : t("unit.CreateUnit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
