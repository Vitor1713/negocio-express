"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppErrorState,
  AppField,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api";
import { useCreateReview, useCustomerOrders } from "../hooks";

const schema = z.object({
  orderId: z.string().uuid("ID do pedido inválido"),
  productId: z.string().uuid("Selecione o produto"),
  rating: z.coerce.number().int().min(1, "Avalie de 1 a 5").max(5),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = { slug: string };

type ReviewSuccess = { productName: string };

export function ReviewsTab({ slug }: Props) {
  const { data: orders, isLoading, isError, error, refetch } = useCustomerOrders(slug);
  const createReview = useCreateReview(slug);
  const [success, setSuccess] = useState<ReviewSuccess | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, orderId: "", productId: "" },
  });

  const selectedOrderId = watch("orderId");
  const selectedProductId = watch("productId");
  const rating = watch("rating");

  // Pedidos com itens, vindos da API (inclui pedidos antigos)
  const eligibleOrders = (orders ?? []).filter((o) => (o.items?.length ?? 0) > 0);

  // Itens do pedido selecionado
  const selectedOrder = eligibleOrders.find((o) => o.id === selectedOrderId);
  const eligibleItems = selectedOrder?.items ?? [];

  const selectedItem = eligibleItems.find((i) => i.productId === selectedProductId);

  async function handleSubmitReview(values: FormValues) {
    setSubmitError(null);
    try {
      await createReview.mutateAsync({
        orderId: values.orderId,
        productId: values.productId,
        rating: values.rating,
        comment: values.comment || null,
      });
      setSuccess({ productName: selectedItem?.productName ?? "Produto" });
      reset();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.messages[0] : "Erro ao enviar avaliação.");
    }
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="font-display font-bold text-lg text-ink-900">Avaliar produto</h2>
        <p className="text-sm text-ink-500 mt-0.5">
          Avalie os produtos dos seus pedidos.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700 flex items-center gap-2">
          <Icon name="CircleCheck" size={15} className="shrink-0" />
          Avaliação de <strong>{success.productName}</strong> enviada com sucesso!
          <button onClick={() => setSuccess(null)} className="ml-auto text-brand-500 hover:text-brand-700">
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <AppSpinner className="h-9 w-9" />
        </div>
      ) : isError ? (
        <AppErrorState title="Erro ao carregar seus pedidos" error={error} onRetry={() => refetch()} />
      ) : eligibleOrders.length === 0 ? (
        <AppEmptyState
          icon="Star"
          title="Nenhum pedido para avaliar"
          desc="Quando você comprar nesta loja, poderá avaliar os produtos por aqui."
        />
      ) : (
        <AppCard className="p-5 sm:p-6">
          <form onSubmit={handleSubmit(handleSubmitReview)} className="space-y-5" noValidate>
            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-start gap-2">
                <Icon name="CircleAlert" size={15} className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Seleção do pedido */}
            <AppField label="Pedido" required error={errors.orderId?.message}>
              <select
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                {...register("orderId", { onChange: () => setValue("productId", "") })}
              >
                <option value="">Selecione um pedido</option>
                {eligibleOrders.map((o) => {
                  const label =
                    o.number != null && o.number !== ""
                      ? `#${o.number}`
                      : "#" + (o.id ?? "").replace(/-/g, "").slice(0, 8).toUpperCase();
                  const count = o.items?.length ?? 0;
                  return (
                    <option key={o.id} value={o.id}>
                      {label} · {count} {count === 1 ? "item" : "itens"}
                    </option>
                  );
                })}
              </select>
            </AppField>

            {/* Seleção do produto */}
            {selectedOrderId && (
              <AppField label="Produto" required error={errors.productId?.message}>
                <div className="space-y-2">
                  {eligibleItems.map((item) => {
                    const active = selectedProductId === item.productId;
                    return (
                      <button
                        key={item.id ?? item.productId}
                        type="button"
                        onClick={() =>
                          setValue("productId", item.productId ?? "", { shouldValidate: true })
                        }
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all",
                          active
                            ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                            : "border-ink-200 hover:bg-ink-50",
                        )}
                      >
                        <span className="h-8 w-8 rounded-md bg-brand-100 text-brand-700 grid place-items-center text-[11px] font-bold shrink-0">
                          {item.quantity}×
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink-900 truncate">{item.productName}</div>
                          {item.variantName && (
                            <div className="text-xs text-ink-500">{item.variantName}</div>
                          )}
                        </div>
                        {active && <Icon name="CircleCheck" size={16} className="text-brand-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </AppField>
            )}

            {/* Estrelas */}
            {selectedProductId && (
              <>
                <AppField label="Avaliação" required error={errors.rating?.message}>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setValue("rating", star, { shouldValidate: true })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Icon
                          name="Star"
                          size={28}
                          strokeWidth={2}
                          className={cn(
                            "transition-colors",
                            star <= (hovered || rating) ? "text-amber-500" : "text-ink-200",
                          )}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-ink-600 font-medium">
                        {["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente"][rating]}
                      </span>
                    )}
                  </div>
                </AppField>

                <AppField label="Comentário (opcional)">
                  <textarea
                    rows={3}
                    placeholder="Conte sua experiência com o produto..."
                    className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none"
                    {...register("comment")}
                  />
                </AppField>

                <AppButton type="submit" fullWidth icon="Send" loading={createReview.isPending}>
                  Enviar avaliação
                </AppButton>
              </>
            )}
          </form>
        </AppCard>
      )}
    </>
  );
}
