"use client";

import { useState } from "react";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppErrorState,
  AppInput,
  AppSpinner,
  Icon,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth";
import { paymentAccountStatusInfo } from "../status";
import {
  usePaymentAccount,
  useCreatePaymentAccount,
  useRefreshPaymentAccountStatus,
  useStore,
} from "../hooks";
import type { PaymentAccount } from "../service";

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

function formatPhone(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function StorePayments() {
  const { data: account, isLoading, isError, error, refetch } = usePaymentAccount();

  // 404 = a loja ainda não criou a subconta → fluxo de onboarding (não é erro de tela).
  const notCreated = error instanceof ApiError && error.status === 404;

  return (
    <>
      <Header />
      {isLoading ? (
        <div className="flex justify-center py-20">
          <AppSpinner className="h-10 w-10" />
        </div>
      ) : isError && !notCreated ? (
        <AppErrorState title="Erro ao carregar a conta de pagamento" error={error} onRetry={() => refetch()} />
      ) : account ? (
        <AccountStatus account={account} />
      ) : (
        <Onboarding />
      )}
    </>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">Pagamentos</h1>
      <p className="text-sm text-ink-500 mt-0.5">
        Conta de recebimento da loja para vendas com Pix e cartão
      </p>
    </div>
  );
}

/** Explicação do modelo de split — comum ao onboarding e ao status. */
function HowItWorks() {
  return (
    <AppCard className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0">
          <Icon name="Info" size={18} />
        </span>
        <h2 className="font-display font-bold text-ink-900">Como funciona</h2>
      </div>
      <ul className="space-y-2.5 text-sm text-ink-600">
        <li className="flex items-start gap-2">
          <Icon name="Check" size={16} className="text-brand-600 mt-0.5 shrink-0" />
          O valor de cada venda cai direto na sua subconta (já com a comissão da plataforma descontada).
        </li>
        <li className="flex items-start gap-2">
          <Icon name="Check" size={16} className="text-brand-600 mt-0.5 shrink-0" />
          Sua loja só consegue receber pagamentos depois que a conta for aprovada.
        </li>
        <li className="flex items-start gap-2">
          <Icon name="ShieldCheck" size={16} className="text-brand-600 mt-0.5 shrink-0" />
          As chaves e segredos da conta não ficam expostos aqui — só o status.
        </li>
      </ul>
    </AppCard>
  );
}

function Onboarding() {
  const { storeRole } = useAuth();
  const { data: store } = useStore();
  const create = useCreatePaymentAccount();
  const [phone, setPhone] = useState(store?.phone ? formatPhone(store.phone) : "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Apenas o Owner cria a subconta (POST /store/payment-account).
  const isOwner = !storeRole || storeRole === "Owner";

  async function handleCreate() {
    setSubmitError(null);
    const digits = onlyDigits(phone);
    try {
      await create.mutateAsync({ mobilePhone: digits || null });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.messages[0] : "Não foi possível criar a conta. Tente novamente.",
      );
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <AppCard className="p-5 sm:p-6">
        <div className="flex items-start gap-3 pb-4 border-b border-ink-100">
          <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft shrink-0">
            <Icon name="Wallet" size={22} />
          </span>
          <div className="min-w-0">
            <div className="font-display font-bold text-ink-900">Ative os recebimentos</div>
            <p className="text-sm text-ink-500 mt-0.5">
              Crie sua conta de pagamento para começar a vender com Pix e cartão na sua loja.
            </p>
          </div>
        </div>

        {isOwner ? (
          <div className="mt-5 space-y-4">
            <AppInput
              label="Celular para contato"
              hint="Usado pelo provedor de pagamento. Por padrão usamos o telefone da loja."
              inputMode="numeric"
              placeholder="(11) 98888-7777"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />

            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <Icon name="CircleAlert" size={16} className="shrink-0" />
                {submitError}
              </div>
            )}

            <AppButton icon="Wallet" loading={create.isPending} onClick={handleCreate}>
              Criar conta de pagamento
            </AppButton>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-500">
            Apenas o dono da loja pode criar a conta de pagamento.
          </p>
        )}
      </AppCard>

      <HowItWorks />
    </div>
  );
}

function AccountStatus({ account }: { account: PaymentAccount }) {
  const { storeRole } = useAuth();
  const refresh = useRefreshPaymentAccountStatus();
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const status = paymentAccountStatusInfo(account.status);
  const canReceive = !!account.canReceivePayments;

  // Só o Owner reconsulta; e só faz sentido enquanto está pendente (Rejected é terminal).
  const isOwner = !storeRole || storeRole === "Owner";
  const canRefresh = isOwner && !canReceive && account.status !== "Rejected";

  async function handleRefresh() {
    setRefreshError(null);
    try {
      await refresh.mutateAsync();
    } catch (err) {
      setRefreshError(
        err instanceof ApiError ? err.messages[0] : "Não foi possível verificar o status. Tente novamente.",
      );
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Banner de gating: enquanto não puder receber, alerta o lojista. */}
      {canReceive ? (
        <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3.5 flex items-center gap-3 text-sm text-brand-800">
          <Icon name="CircleCheck" size={18} className="shrink-0 text-brand-600" />
          Sua loja está pronta para receber pagamentos.
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5 flex items-start gap-3 text-sm text-amber-800">
          <Icon name="TriangleAlert" size={18} className="shrink-0 mt-0.5 text-amber-600" />
          <div className="min-w-0 flex-1">
            <div className="font-medium">Sua conta ainda não pode receber pagamentos.</div>
            <p className="mt-0.5 text-amber-700">
              {account.status === "Rejected"
                ? "A conta foi recusada pelo provedor. Entre em contato com o suporte."
                : "Estamos analisando seu cadastro. A aprovação é verificada automaticamente, mas você pode conferir agora."}
            </p>
            {canRefresh && (
              <div className="mt-3">
                <AppButton
                  variant="secondary"
                  size="sm"
                  icon="RefreshCw"
                  loading={refresh.isPending}
                  onClick={handleRefresh}
                >
                  Verificar aprovação
                </AppButton>
                {refreshError && (
                  <p className="mt-2 text-xs text-red-700 flex items-center gap-1.5">
                    <Icon name="CircleAlert" size={14} className="shrink-0" />
                    {refreshError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <AppCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-ink-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft shrink-0">
              <Icon name="Wallet" size={22} />
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-ink-900">Conta de pagamento</div>
              <div className="text-xs text-ink-500">Recebimentos de Pix e cartão</div>
            </div>
          </div>
          <AppBadge tone={status.tone} dot>
            {status.label}
          </AppBadge>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <Row label="Pode receber pagamentos">
            <AppBadge tone={canReceive ? "success" : "warning"} dot>
              {canReceive ? "Sim" : "Não"}
            </AppBadge>
          </Row>
          {account.walletId && (
            <Row label="ID da carteira">
              <span className="text-ink-900 font-mono text-xs">{account.walletId}</span>
            </Row>
          )}
          <Row label="Criada em">
            <span className="text-ink-900 font-medium">{fmtDate(account.createdAt)}</span>
          </Row>
        </div>
      </AppCard>

      <HowItWorks />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-ink-500">{label}</span>
      {children}
    </div>
  );
}
