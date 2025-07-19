import { useTranslation } from "react-i18next";

import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import type { Unit, RentalFormValues } from "@/types/schema/Unit";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search } from "lucide-react";
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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function CreateNewRental() {
  const { t } = useTranslation("app-sidebar");

  const form = useForm<RentalFormValues>({
    defaultValues: {
      unitID: "",
      contractNumber: "",
      moveTypeID: "",
      startDate: "",
      endDate: "",
      rentalSourceID: "",
      startPrice: 0,
      currentPrice: 0,
      status: "active",
      securityDeposit: 0,
      rentalAmount: 0,
      isMonthly: false,
      monthsCount: 0,
      roommates: 0,
      notes: "",
      periodicIncrease: {
        increaseValue: 0,
        periodicDuration: 0,
        isPercentage: false,
      },
      participants: {
        owner: { userID: "" },
        tentant: { userID: "" },
      },
    },
  });

  const [open, setOpen] = useState(false);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);

  // Fetch units data
  const { data: units = [], isLoading: unitsLoading } = useApiQuery<Unit[]>({
    queryKey: ["units"],
    endpoint: "/data/units.json",
    useLocalJson: true,
  });
  const [unitSearch, setUnitSearch] = useState("");
  const selectedUnit = units.find((u) => u._id === form.watch("unitID"));
  const filteredUnits = units.filter((u) =>
    u.number.toLowerCase().includes(unitSearch.toLowerCase()),
  );

  const createRentalMutation = useApiMutation({
    method: "post",
    endpoint: "/rentals",
    options: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating rental:", error);
      },
    },
  });

  const onSubmit = (data: RentalFormValues) => {
    createRentalMutation.mutate(data);
  };

  const moveTypes = [
    { id: "1", name: t("NewRental") },
    { id: "2", name: t("Renewal") },
    { id: "3", name: t("Transfer") },
  ];

  const rentalSources = [
    { id: "1", name: t("Booking") },
    { id: "2", name: t("GatherInn") },
    { id: "3", name: t("OvernightStay") },
    { id: "4", name: t("RealEstate") },
    { id: "5", name: t("Auction") },
    { id: "6", name: t("Airbnb") },
    { id: "7", name: t("Rent") },
    { id: "8", name: t("WhatsApp") },
    { id: "9", name: t("Other") },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip={t("CreateNewRental")}
          className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
        >
          <IconCirclePlusFilled />
          <span>{t("CreateNewRental")}</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("CreateNewRental")}</DialogTitle>
          <DialogDescription>{t("FillRentalForm")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unitID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Unit")}</FormLabel>
                    <Popover
                      open={unitPopoverOpen}
                      onOpenChange={setUnitPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={unitPopoverOpen}
                          className="h-10 w-full justify-between px-3"
                          disabled={unitsLoading}
                        >
                          {selectedUnit ? (
                            <div className="flex items-center gap-2">
                              {/* Optionally show a unit icon or image here */}
                              <span className="text-sm font-medium">
                                {selectedUnit.number}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {unitsLoading ? t("Loading") : t("SelectUnit")}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 opacity-50" />
                            <CommandInput
                              placeholder={t("SearchUnit")}
                              value={unitSearch}
                              onValueChange={setUnitSearch}
                              className="flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-none"
                            />
                          </div>
                          <CommandList>
                            <CommandEmpty>{t("NoUnitFound")}</CommandEmpty>
                            <ScrollArea className="h-60">
                              {filteredUnits.map((unit) => (
                                <CommandItem
                                  key={unit._id}
                                  value={unit.number}
                                  onSelect={() => {
                                    field.onChange(unit._id);
                                    setUnitPopoverOpen(false);
                                    setUnitSearch("");
                                  }}
                                  className="flex items-center gap-2 px-2 py-1.5"
                                >
                                  {/* Optionally show a unit icon or image here */}
                                  <span className="text-sm">{unit.number}</span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === unit._id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ContractNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("EnterContractNumber")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moveTypeID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("MoveType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("SelectMoveType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                name="rentalSourceID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("RentalSource")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("SelectRentalSource")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rentalSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("StartDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EndDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("StartPrice")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("CurrentPrice")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("SecurityDeposit")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("RentalAmount")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isMonthly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("MonthlyRental")}</FormLabel>
                      <FormDescription>
                        {t("CheckMonthlyRental")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("MonthsCount")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roommates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Roommates")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Notes")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("AdditionalNotes")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="periodicIncrease.increaseValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("IncreaseValue")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodicIncrease.periodicDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("DurationInMonths")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodicIncrease.isPercentage"
                render={({ field }) => (
                  <FormItem className="mt-6 flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="leading-none">
                      {t("IsPercentage")}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="participants.owner.userID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Owner")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Owner")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participants.tentant.userID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Tenant")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Tenant")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("SelectStatus")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("Active")}</SelectItem>
                      <SelectItem value="completed">
                        {t("Completed")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("Cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createRentalMutation.isPending}>
                {createRentalMutation.isPending
                  ? t("Creating")
                  : t("CreateRental")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
