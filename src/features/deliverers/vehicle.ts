import type { IconName } from "@/components/ui";

/**
 * Tipos de veículo (`vehicleType`, string livre no openapi). O backend usa uma
 * enum PascalCase, validada por probe: **Motorcycle, Bicycle, Car, OnFoot**
 * (entrada case-insensitive; resposta em PascalCase). NÃO existe "van"/"foot".
 */
export const VEHICLE_TYPE: Record<string, { label: string; icon: IconName }> = {
  Motorcycle: { label: "Moto", icon: "Bike" },
  Bicycle: { label: "Bicicleta", icon: "Bike" },
  Car: { label: "Carro", icon: "Car" },
  OnFoot: { label: "A pé", icon: "Footprints" },
};

export function vehicleInfo(type?: string) {
  return (type && VEHICLE_TYPE[type]) || { label: type ?? "—", icon: "Bike" as IconName };
}
