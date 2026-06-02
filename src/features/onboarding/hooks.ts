import { useMutation, useQuery } from "@tanstack/react-query";
import { listPlans, register, type RegisterInput } from "./service";

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: listPlans });
}

export function useRegister() {
  return useMutation({ mutationFn: (body: RegisterInput) => register(body) });
}
