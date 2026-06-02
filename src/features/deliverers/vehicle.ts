import type { IconName } from "@/components/ui";

export const VEHICLE_TYPE: Record<string, { label: string; icon: IconName }> = {
  motorcycle: { label: "Moto", icon: "Bike" },
  bicycle: { label: "Bicicleta", icon: "Bike" },
  car: { label: "Carro", icon: "Car" },
  van: { label: "Van", icon: "Truck" },
  foot: { label: "A pé", icon: "Footprints" },
};

export function vehicleInfo(type?: string) {
  return (type && VEHICLE_TYPE[type]) || { label: type ?? "—", icon: "Bike" as IconName };
}
