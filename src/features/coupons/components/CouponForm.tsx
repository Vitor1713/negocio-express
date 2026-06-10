"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppDrawer, AppField, AppInput, AppSpinner, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useCoupon } from "../hooks";
import { DISCOUNT_TYPES, num, type DiscountType } from "../discount";
import type { RequestCoupon } from "../service";

const parseNum = (v: string) => {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const schema = z.object({
  code: z.string().trim().min(1, "Informe o código."),
  discountType: z.enum(["Percentage", "FixedAmount"]),
  discountValue: z
    .string()
    .refine((v) => parseNum(v) > 0, "Valor deve ser maior que zero."),
  minOrderAmount: z.string(),
  maxUses: z.string(),
  validUntil: z.string(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  code: "",
  discountType: "Percentage",
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  validUntil: "",
  isActive: true,
};

type Props = {
  open: boolean;
  /** null = criar; id = editar (carrega via GET /coupons/{id}). */
  couponId: string | null;
  saving?: boolean;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (body: RequestCoupon) => void;
  onDelete: () => void;
};

export function CouponForm({
  open,
  couponId,
  saving,
  deleting,
  error,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEdit = !!couponId;
  const detail = useCoupon(open && isEdit ? couponId : null);
  const [confirmDel, setConfirmDel] = useState(false);
  // validFrom não tem UI; preserva o valor existente na edição.
  const validFromRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    if (isEdit && detail.data) {
      const c = detail.data;
      validFromRef.current = c.validFrom ?? null;
      reset({
        code: c.code ?? "",
        discountType: (c.discountType as DiscountType) ?? "Percentage",
        discountValue: String(num(c.discountValue)),
        minOrderAmount: c.minOrderAmount != null ? String(num(c.minOrderAmount)) : "",
        maxUses: c.maxUses != null ? String(c.maxUses) : "",
        validUntil: c.validUntil ? String(c.validUntil).slice(0, 10) : "",
        isActive: c.isActive ?? true,
      });
    } else if (!isEdit) {
      validFromRef.current = null;
      reset(EMPTY);
    }
  }, [open, isEdit, detail.data, reset]);

  const discountType = watch("discountType");
  const isActive = watch("isActive");

  function submit(v: FormValues) {
    const body: RequestCoupon = {
      code: v.code.toUpperCase().replace(/\s/g, ""),
      discountType: v.discountType,
      discountValue: parseNum(v.discountValue),
      minOrderAmount: v.minOrderAmount.trim() === "" ? null : parseNum(v.minOrderAmount),
      maxUses: v.maxUses.trim() === "" ? null : parseInt(v.maxUses.replace(/\D/g, ""), 10) || null,
      validFrom: validFromRef.current,
      validUntil: v.validUntil ? `${v.validUntil}T23:59:00` : null,
      isActive: v.isActive,
    };
    onSave(body);
  }

  function handleClose() {
    reset(EMPTY);
    onClose();
  }

  const loadingDetail = isEdit && detail.isLoading;

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      icon="Ticket"
      width={460}
      title={isEdit ? "Editar cupom" : "Novo cupom"}
      subtitle={isEdit ? "Atualize as regras do cupom" : "Crie um cupom de desconto"}
      footer={
        <div className="flex gap-2">
          {isEdit &&
            (confirmDel ? (
              <AppButton variant="danger" icon="Trash2" loading={deleting} onClick={onDelete}>
                Confirmar
              </AppButton>
            ) : (
              <AppButton variant="outline" icon="Trash2" onClick={() => setConfirmDel(true)}>
                Excluir
              </AppButton>
            ))}
          <AppButton
            type="submit"
            form="coupon-form"
            fullWidth
            icon="Check"
            loading={saving}
            disabled={loadingDetail}
          >
            Salvar cupom
          </AppButton>
        </div>
      }
    >
      {loadingDetail ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-8 w-8" />
        </div>
      ) : (
        <form id="coupon-form" onSubmit={handleSubmit(submit)} className="p-5 space-y-4" noValidate>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <Icon name="CircleAlert" size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <AppInput
            label="Código"
            required
            placeholder="BOMDIA10"
            icon="Ticket"
            error={errors.code?.message}
            {...register("code", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/\s/g, "");
              },
            })}
          />

          <AppField label="Tipo de desconto" error={errors.discountType?.message}>
            <div className="grid grid-cols-2 gap-2">
              {DISCOUNT_TYPES.map((t) => {
                const active = discountType === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setValue("discountType", t.key, { shouldValidate: true })}
                    className={cn(
                      "py-2.5 rounded-lg border text-sm font-medium transition-all",
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                        : "border-ink-200 text-ink-700 hover:bg-ink-50",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </AppField>

          <div className="grid grid-cols-2 gap-4">
            <AppInput
              label={discountType === "Percentage" ? "Desconto (%)" : "Desconto (R$)"}
              required
              inputMode="decimal"
              placeholder="10"
              error={errors.discountValue?.message}
              {...register("discountValue")}
            />
            <AppInput
              label="Pedido mínimo (R$)"
              inputMode="decimal"
              placeholder="Opcional"
              hint="Vazio = sem mínimo"
              {...register("minOrderAmount")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AppInput
              label="Limite de usos"
              inputMode="numeric"
              placeholder="Ilimitado"
              hint="Vazio = ilimitado"
              {...register("maxUses")}
            />
            <AppField label="Válido até" htmlFor="coupon-valid-until">
              <input
                id="coupon-valid-until"
                type="date"
                {...register("validUntil")}
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </AppField>
          </div>

          <button
            type="button"
            onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40 text-left"
          >
            <span className="text-sm font-medium text-ink-900">Cupom ativo</span>
            <span
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors shrink-0",
                isActive ? "bg-brand-600" : "bg-ink-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                  isActive ? "left-[22px]" : "left-0.5",
                )}
              />
            </span>
          </button>
        </form>
      )}
    </AppDrawer>
  );
}
