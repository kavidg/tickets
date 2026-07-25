/**
 * TicketS - CheckoutPage
 *
 * Checkout público — no requiere autenticación.
 * Flujo: Leer selección → Formulario comprador → POST /purchases → POST /checkout → Bold Button
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, CreditCard, Loader2, Mail, Phone, ShoppingCart, User } from 'lucide-react';
import { formatPrice } from '../utils/format.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const BOLD_SDK_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

async function publicFetch(path, method, body) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result?.message || result?.error || `Error del servidor (${res.status})` };
    }
    return { success: true, data: result?.data || result };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor. Verifica tu conexión.' };
  }
}

function loadBoldSDK() {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${BOLD_SDK_URL}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = BOLD_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de Bold.'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState(null);
  const [boldLoading, setBoldLoading] = useState(false);
  const [boldError, setBoldError] = useState(null);

  const [eventData, setEventData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const boldContainerRef = useRef(null);

  // Step tracking: 1=form, 2=payment
  const [step, setStep] = useState(1);

  // Leer selección al montar
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('checkout_selection');
      if (stored) {
        setSelection(JSON.parse(stored));
      } else {
        setError('No hay selección de entradas. Vuelve al evento y selecciona tus entradas.');
      }
    } catch {
      setError('Error al leer la selección. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener precios reales
  useEffect(() => {
    if (!selection) return;
    let cancelled = false;

    async function fetchPrices() {
      setLoadingPrices(true);
      try {
        const res = await fetch(`${API_URL}/events/public/${encodeURIComponent(selection.slug)}`);
        if (!res.ok || cancelled) return;
        const body = await res.json();
        const data = body?.data || body;
        if (!data?.ticketTypes || cancelled) return;
        setEventData(data);

        let total = 0;
        for (const item of selection.items) {
          const tt = data.ticketTypes.find((t) => t.id === item.ticketTypeId);
          if (tt) total += tt.price * item.quantity;
        }
        if (!cancelled) setTotalPrice(total);
      } catch {
        // Silent fail
      } finally {
        if (!cancelled) setLoadingPrices(false);
      }
    }

    fetchPrices();
    return () => { cancelled = true; };
  }, [selection]);

  // Inicializar Bold SDK
  useEffect(() => {
    if (!checkout || !boldContainerRef.current) return;
    let cancelled = false;

    async function initBoldButton() {
      setBoldLoading(true);
      setBoldError(null);
      try {
        if (cancelled) return;
        boldContainerRef.current.innerHTML = '';
        const boldScript = document.createElement('script');
        boldScript.setAttribute('data-bold-button', 'light-L');
        boldScript.setAttribute('data-api-key', checkout.publicKey);
        boldScript.setAttribute('data-order-id', checkout.reference);
        boldScript.setAttribute('data-amount', String(Math.round(checkout.amount)));
        boldScript.setAttribute('data-currency', checkout.currency);
        boldScript.setAttribute('data-integrity-signature', checkout.signature);
        boldScript.setAttribute('data-description', `Compra ${checkout.reference}`);
        boldScript.setAttribute('data-customer-data', JSON.stringify({
          email: buyerEmail.trim(),
          fullName: buyerName.trim(),
          phone: buyerPhone.trim(),
        }));
        boldScript.setAttribute('data-redirection-url', `${window.location.origin}/purchase/success`);
        boldContainerRef.current.appendChild(boldScript);
        await loadBoldSDK();
      } catch (err) {
        if (!cancelled) setBoldError(err.message || 'Error al cargar el botón de pago.');
      } finally {
        if (!cancelled) setBoldLoading(false);
      }
    }

    initBoldButton();
    return () => { cancelled = true; };
  }, [checkout, buyerName, buyerEmail]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!buyerName.trim()) errors.name = 'El nombre es obligatorio.';
    else if (buyerName.trim().length < 3) errors.name = 'Mínimo 3 caracteres.';
    if (!buyerEmail.trim()) errors.email = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) errors.email = 'Correo inválido.';
    if (!buyerPhone.trim()) errors.phone = 'El teléfono es obligatorio.';
    else if (!/^[\d\s+\-()]{7,20}$/.test(buyerPhone.trim())) errors.phone = 'Teléfono inválido.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [buyerName, buyerEmail, buyerPhone]);

  async function handleProcessPurchase() {
    if (!selection || processing) return;
    if (!validateForm()) return;

    setProcessing(true);
    setError(null);

    try {
      let ticketTypes = eventData?.ticketTypes || [];
      if (ticketTypes.length === 0) {
        const eventRes = await fetch(`${API_URL}/events/public/${encodeURIComponent(selection.slug)}`);
        if (eventRes.ok) {
          const body = await eventRes.json();
          const data = body?.data || body;
          ticketTypes = data?.ticketTypes || [];
        }
      }

      let total = 0;
      for (const item of selection.items) {
        const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
        if (tt) total += tt.price * item.quantity;
      }

      const purchasePayload = {
        eventId: selection.eventId,
        organizationId: selection.organizationId,
        items: selection.items,
        buyer: { name: buyerName.trim(), email: buyerEmail.trim(), phone: buyerPhone.trim() },
      };

      console.log('[CheckoutPage] purchase payload:', JSON.stringify(purchasePayload));
      const purchaseRes = await publicFetch('/purchases', 'POST', purchasePayload);
      console.log('[CheckoutPage] purchase response:', JSON.stringify(purchaseRes));

      if (!purchaseRes.success) {
        setError(purchaseRes.error || 'Error al crear la compra.');
        setProcessing(false);
        return;
      }

      const purchaseData = purchaseRes.data;
      setPurchase(purchaseData);

      const checkoutRes = await publicFetch('/checkout', 'POST', { purchaseId: purchaseData.id });
      console.log('[CheckoutPage] checkout response:', JSON.stringify(checkoutRes));

      if (!checkoutRes.success) {
        setError(checkoutRes.error || 'Error al iniciar el pago.');
        setProcessing(false);
        return;
      }

      const checkoutData = checkoutRes.data;
      setCheckout(checkoutData);
      setStep(2);

      const reference = checkoutData.reference || '';
      sessionStorage.setItem('last_purchase_id', purchaseData.id);
      sessionStorage.setItem('last_purchase_data', JSON.stringify({
        purchaseId: purchaseData.id,
        eventId: selection.eventId,
        eventTitle: selection.title,
        reference,
        total,
        status: 'pending',
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
      }));
    } catch (err) {
      setError(err?.message || 'Error inesperado.');
    } finally {
      setProcessing(false);
    }
  }

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-900 pt-16">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // No selection
  // -----------------------------------------------------------------------
  if (!selection) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-900 pt-16">
        <div className="max-w-md px-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800">
            <ShoppingCart className="h-6 w-6 text-neutral-400" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">No hay entradas seleccionadas</h1>
          <p className="mt-2 text-sm text-neutral-400">{error}</p>
          <a href="/" className="btn-primary mt-6 inline-flex">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // Bold payment step
  // -----------------------------------------------------------------------
  if (step === 2 && checkout) {
    const itemCount = selection.items.reduce((s, i) => s + i.quantity, 0);
    const amount = checkout.amount || totalPrice || 0;
    const currency = checkout.currency || 'COP';

    return (
      <main className="min-h-screen bg-neutral-900 pt-24">
        <div className="section-container pb-16">
          {/* Steps indicator */}
          <div className="mb-8 flex items-center justify-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 rounded-lg bg-brand/20 px-3 py-1.5 text-xs font-medium text-brand-light">
              1. Datos
            </span>
            <div className="h-px w-8 bg-white/[0.1]" />
            <span className="flex items-center gap-1.5 rounded-lg bg-brand/20 px-3 py-1.5 text-xs font-medium text-brand-light">
              2. Pago
            </span>
          </div>

          <div className="mx-auto max-w-lg">
            <div className="card-base p-6 sm:p-8">
              <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted">
                <CreditCard className="h-6 w-6 text-brand-light" />
              </div>

              <h1 className="text-center text-xl font-bold text-white">Pago seguro</h1>
              <p className="mt-1 text-center text-sm text-neutral-400">{selection.title}</p>

              {/* Resumen */}
              <div className="mt-6 space-y-2.5 rounded-xl border border-white/[0.06] bg-neutral-800/50 px-4 py-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Entradas</span>
                  <span className="font-medium text-white">{itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total</span>
                  <span className="font-bold text-brand-light">{formatPrice(amount)} {currency}</span>
                </div>
                <hr className="border-white/[0.06]" />
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Referencia</span>
                  <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-neutral-300">{checkout.reference}</code>
                </div>
              </div>

              {/* Bold Button */}
              <div className="mt-6">
                {boldLoading && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparando pago seguro...
                  </div>
                )}
                {boldError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                    {boldError}
                  </div>
                )}
                <div ref={boldContainerRef} className="bold-button-wrapper" />
              </div>

              <p className="mt-4 text-center text-xs text-neutral-500">
                Pago procesado de forma segura por <span className="font-medium text-brand-light">Bold</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // Form step
  // -----------------------------------------------------------------------
  const itemCount = selection.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="min-h-screen bg-neutral-900 pt-24">
      <div className="section-container pb-16">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 rounded-lg bg-brand/20 px-3 py-1.5 text-xs font-medium text-brand-light">
            1. Datos
          </span>
          <div className="h-px w-8 bg-white/[0.1]" />
          <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400">
            2. Pago
          </span>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="card-base p-6 sm:p-8">
            {/* Back link */}
            <a
              href={`/event/${selection.slug}`}
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al evento
            </a>

            <h1 className="text-xl font-bold text-white">Finalizar compra</h1>

            {/* Resumen de compra */}
            <div className="mt-4 space-y-2 rounded-xl border border-white/[0.06] bg-neutral-800/50 px-4 py-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Evento</span>
                <span className="font-medium text-white">{selection.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Entradas</span>
                <span className="font-medium text-white">{itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}</span>
              </div>
              {selection.items.map((item) => {
                const tt = eventData?.ticketTypes?.find((t) => t.id === item.ticketTypeId);
                return (
                  <div key={item.ticketTypeId} className="flex justify-between pl-3 text-xs">
                    <span className="text-neutral-500">{tt?.name || item.ticketTypeId.slice(0, 8)} × {item.quantity}</span>
                    {tt && <span className="text-neutral-400">{formatPrice(tt.price * item.quantity)}</span>}
                  </div>
                );
              })}
              {totalPrice !== null && (
                <>
                  <hr className="border-white/[0.06]" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-bold text-brand-light">
                      {loadingPrices ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : formatPrice(totalPrice)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Formulario */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Datos del comprador
              </p>
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="buyerName" className="mb-1 block text-xs font-medium text-neutral-400">Nombre completo</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="buyerName"
                      type="text"
                      value={buyerName}
                      onChange={(e) => { setBuyerName(e.target.value); if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined })); }}
                      placeholder="Tu nombre completo"
                      className={`input-base pl-9 ${formErrors.name ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                  {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="buyerEmail" className="mb-1 block text-xs font-medium text-neutral-400">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="buyerEmail"
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => { setBuyerEmail(e.target.value); if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined })); }}
                      placeholder="tu@correo.com"
                      className={`input-base pl-9 ${formErrors.email ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                  {formErrors.email && <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="buyerPhone" className="mb-1 block text-xs font-medium text-neutral-400">Teléfono</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="buyerPhone"
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => { setBuyerPhone(e.target.value); if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined })); }}
                      placeholder="+57 300 123 4567"
                      className={`input-base pl-9 ${formErrors.phone ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                  {formErrors.phone && <p className="mt-1 text-xs text-red-400">{formErrors.phone}</p>}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleProcessPurchase}
              disabled={processing}
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                'Continuar al pago'
              )}
            </button>

            <p className="mt-3 text-center text-xs text-neutral-500">
              Serás redirigido al entorno seguro de Bold
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
