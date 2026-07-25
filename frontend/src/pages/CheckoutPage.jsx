/**
 * TicketS - CheckoutPage
 *
 * Página de checkout público — no requiere autenticación.
 *
 * Flujo:
 *   1. Lee la selección guardada en sessionStorage (desde EventDetailPage).
 *   2. Muestra formulario del comprador (nombre, email, teléfono).
 *   3. POST /api/v1/purchases → Crea la compra con datos del comprador.
 *   4. POST /api/v1/checkout   → Obtiene reference, amount, currency, signature, publicKey.
 *   5. Inicializa el Bold Button SDK automáticamente.
 *   6. El usuario paga directamente en el checkout oficial de Bold.
 *   7. Bold redirige a #/purchase/success al completar el pago.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Loader2, ShoppingCart, User, Mail, Phone, Copy, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/format.js';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const BOLD_SDK_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function publicFetch(path, method, body) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error:
          result?.message ||
          result?.error ||
          `Error del servidor (${res.status})`,
      };
    }

    return { success: true, data: result?.data || result };
  } catch {
    return {
      success: false,
      error: 'No se pudo conectar con el servidor. Verifica tu conexión.',
    };
  }
}

/**
 * Carga el SDK de Bold dinámicamente si no está cargado aún.
 * Retorna una promesa que se resuelve cuando el script está listo.
 */
function loadBoldSDK() {
  return new Promise((resolve, reject) => {
    // Evitar carga duplicada
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

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState(null);
  const [boldLoading, setBoldLoading] = useState(false);
  const [boldError, setBoldError] = useState(null);

  // Datos del evento y precio total (obtenidos de la API para mostrar al usuario)
  const [eventData, setEventData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Formulario del comprador
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Ref para el contenedor del botón Bold
  const boldContainerRef = useRef(null);

  // -----------------------------------------------------------------------
  // Leer selección al montar
  // -----------------------------------------------------------------------

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('checkout_selection');
      if (stored) {
        setSelection(JSON.parse(stored));
      } else {
        setError(
          'No hay selección de entradas. Vuelve al evento y selecciona tus entradas.',
        );
      }
    } catch {
      setError('Error al leer la selección. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Obtener precios reales del evento
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!selection) return;

    let cancelled = false;

    async function fetchPrices() {
      setLoadingPrices(true);

      try {
        const res = await fetch(
          `${API_URL}/events/public/${encodeURIComponent(selection.slug)}`,
        );
        if (!res.ok || cancelled) return;

        const body = await res.json();
        const data = body?.data || body;
        if (!data?.ticketTypes || cancelled) return;

        setEventData(data);

        // Calcular total desde los precios reales del servidor
        let total = 0;
        for (const item of selection.items) {
          const tt = data.ticketTypes.find((t) => t.id === item.ticketTypeId);
          if (tt) total += tt.price * item.quantity;
        }

        if (!cancelled) {
          setTotalPrice(total);
        }
      } catch {
        // Error al obtener precios — no bloquear, solo no mostrar total
      } finally {
        if (!cancelled) setLoadingPrices(false);
      }
    }

    fetchPrices();

    return () => {
      cancelled = true;
    };
  }, [selection]);

  // -----------------------------------------------------------------------
  // Inicializar Bold SDK cuando el checkout esté listo
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!checkout || !boldContainerRef.current) return;

    let cancelled = false;

    async function initBoldButton() {
      setBoldLoading(true);
      setBoldError(null);

      try {
        if (cancelled) return;

        // 1. Limpiar contenedor por si ya hay un botón previo
        boldContainerRef.current.innerHTML = '';

        // 2. Crear script con data-atributos para Bold Button
        //    IMPORTANTE: el elemento debe estar en el DOM ANTES de cargar el SDK
        //    para que Bold lo detecte al procesar la página.
        const boldScript = document.createElement('script');
        boldScript.setAttribute('data-bold-button', 'light-L');
        boldScript.setAttribute('data-api-key', checkout.publicKey);
        boldScript.setAttribute('data-order-id', checkout.reference);
        boldScript.setAttribute('data-amount', String(Math.round(checkout.amount)));
        boldScript.setAttribute('data-currency', checkout.currency);
        boldScript.setAttribute('data-integrity-signature', checkout.signature);
        boldScript.setAttribute(
          'data-description',
          `Compra ${checkout.reference}`,
        );
        boldScript.setAttribute(
          'data-customer-data',
          JSON.stringify({
            email: buyerEmail.trim(),
            fullName: buyerName.trim(),
            phone: buyerPhone.trim(),
          }),
        );
        boldScript.setAttribute(
          'data-redirection-url',
          `${window.location.origin}/purchase/success`,
        );

        // 3. Insertar el elemento en el DOM antes de cargar el SDK
        boldContainerRef.current.appendChild(boldScript);

        // 4. Ahora cargar el SDK de Bold (encontrará el elemento ya existente)
        await loadBoldSDK();
      } catch (err) {
        if (!cancelled) {
          setBoldError(err.message || 'Error al cargar el botón de pago.');
        }
      } finally {
        if (!cancelled) setBoldLoading(false);
      }
    }

    initBoldButton();

    return () => {
      cancelled = true;
    };
  }, [checkout, buyerName, buyerEmail]);

  // -----------------------------------------------------------------------
  // Validación del formulario
  // -----------------------------------------------------------------------

  const validateForm = useCallback(() => {
    const errors = {};

    if (!buyerName.trim()) {
      errors.name = 'El nombre es obligatorio.';
    } else if (buyerName.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!buyerEmail.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!buyerPhone.trim()) {
      errors.phone = 'El teléfono es obligatorio.';
    } else if (!/^[\d\s+\-()]{7,20}$/.test(buyerPhone.trim())) {
      errors.phone = 'Ingresa un número de teléfono válido.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [buyerName, buyerEmail, buyerPhone]);

  // -----------------------------------------------------------------------
  // Procesar compra
  // -----------------------------------------------------------------------

  async function handleProcessPurchase() {
    if (!selection || processing) return;

    if (!validateForm()) return;

    setProcessing(true);
    setError(null);

    try {
      // Obtener ticket types si no se tienen
      let ticketTypes = eventData?.ticketTypes || [];
      if (ticketTypes.length === 0) {
        const eventRes = await fetch(
          `${API_URL}/events/public/${encodeURIComponent(selection.slug)}`,
        );
        if (!eventRes.ok) {
          setError('Error al obtener información del evento.');
          setProcessing(false);
          return;
        }
        const eventBody = await eventRes.json();
        const data = eventBody?.data || eventBody;
        ticketTypes = data?.ticketTypes || [];
      }

      // Calcular total desde los precios reales del servidor
      let total = 0;
      for (const item of selection.items) {
        const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
        if (tt) total += tt.price * item.quantity;
      }

      // 1. Crear Purchase (público, sin autenticación)
      const purchasePayload = {
        eventId: selection.eventId,
        organizationId: selection.organizationId,
        items: selection.items,
        buyer: {
          name: buyerName.trim(),
          email: buyerEmail.trim(),
          phone: buyerPhone.trim(),
        },
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

      // 2. Iniciar checkout (público, sin autenticación)
      const checkoutRes = await publicFetch('/checkout', 'POST', {
        purchaseId: purchaseData.id,
      });

      console.log('[CheckoutPage] checkout response:', JSON.stringify(checkoutRes));

      if (!checkoutRes.success) {
        setError(checkoutRes.error || 'Error al iniciar el pago.');
        setProcessing(false);
        return;
      }

      const checkoutData = checkoutRes.data;
      setCheckout(checkoutData);

      // 3. Guardar datos de la compra
      const reference = checkoutData.reference || '';
      sessionStorage.setItem('last_purchase_id', purchaseData.id);
      sessionStorage.setItem(
        'last_purchase_data',
        JSON.stringify({
          purchaseId: purchaseData.id,
          eventId: selection.eventId,
          eventTitle: selection.title,
          reference,
          total,
          status: 'pending',
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
        }),
      );

      console.log('[CheckoutPage] Bold data ready:', {
        reference: checkoutData.reference,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        signature: checkoutData.signature?.slice(0, 16) + '…',
        publicKey: checkoutData.publicKey?.slice(0, 12) + '…',
      });
    } catch (err) {
      setError(err?.message || 'Error inesperado al procesar la compra.');
    } finally {
      setProcessing(false);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // Estado: cargando selección
  if (loading) {
    return (
      <main className="mx-auto flex max-w-3xl items-center justify-center px-4 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-luxe-ember" />
      </main>
    );
  }

  // Estado: sin selección
  if (!selection) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
          No hay entradas seleccionadas
        </h1>
        <p className="mt-4 text-red-100/60">{error}</p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 font-black text-luxe-ember transition hover:text-red-100"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </a>
      </main>
    );
  }

  // Estado: error (sin purchase creada aún)
  if (error && !purchase) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-luxe-ember">
          Error
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
          No pudimos procesar tu compra
        </h1>
        <p className="mt-4 text-red-100/60">{error}</p>
        <a
          href={`/event/${selection.slug}`}
          className="mt-8 inline-flex items-center gap-2 font-black text-luxe-ember transition hover:text-red-100"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al evento
        </a>
      </main>
    );
  }

  // Estado: checkout iniciado — mostrar Bold Button
  if (checkout) {
    const itemCount = selection.items.reduce((s, i) => s + i.quantity, 0);
    const amount = checkout.amount || totalPrice || 0;
    const currency = checkout.currency || 'COP';

    return (
      <main className="relative mx-auto max-w-2xl px-4 py-12">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl">
          {/* Icono */}
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/15">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-center text-2xl font-black tracking-tight text-white">
            Pago seguro
          </h1>
          <p className="mt-2 text-center text-sm text-red-100/60">
            {selection.title}
          </p>

          {/* Resumen de compra */}
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Entradas</span>
              <span className="font-bold text-white">
                {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Referencia</span>
              <span className="flex items-center gap-2">
                <code className="rounded-lg border border-white/10 bg-luxe-black/80 px-2 py-0.5 font-mono text-xs text-luxe-ember">
                  {checkout.reference}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(checkout.reference)}
                  className="text-red-100/30 transition hover:text-luxe-ember"
                  title="Copiar referencia"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-100/50">Total</span>
              <span className="font-black text-luxe-ember">
                {formatPrice(amount)} {currency}
              </span>
            </div>
          </div>

          {/* Bold Button Container */}
          <div className="mt-6">
            {boldLoading && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-6 py-5">
                <Loader2 className="h-5 w-5 animate-spin text-luxe-ember" />
                <span className="text-sm font-semibold text-red-100/60">
                  Preparando pago seguro…
                </span>
              </div>
            )}

            {boldError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300">
                {boldError}
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 underline hover:text-red-200"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* El SDK de Bold renderiza el botón aquí */}
            <div ref={boldContainerRef} className="bold-button-wrapper" />
          </div>

          <p className="mt-4 text-center text-xs text-red-100/40">
            Pago procesado de forma segura por{' '}
            <span className="font-bold text-luxe-ember">Bold</span>.
            Después del pago serás redirigido automáticamente.
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // Estado principal: formulario + resumen
  // -----------------------------------------------------------------------

  const itemCount = selection.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-luxe-wine/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-luxe-ember/10 blur-3xl" />

      <a
        href={`/event/${selection.slug}`}
        className="relative mb-6 inline-flex items-center gap-2 text-sm font-semibold text-red-100/50 transition hover:text-luxe-ember"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al evento
      </a>

      <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-deep-luxe backdrop-blur-2xl">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-luxe-ember/30 bg-gradient-to-br from-luxe-wine to-luxe-black shadow-lg shadow-luxe-ember/15">
          <ShoppingCart className="h-7 w-7 text-white" />
        </div>

        <h1 className="text-center text-2xl font-black tracking-tight text-white">
          Finalizar compra
        </h1>
        <p className="mt-2 text-center text-sm text-red-100/60">
          {selection.title}
        </p>

        {/* Resumen de la compra */}
        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-luxe-black/60 px-5 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-red-100/50">Evento</span>
            <span className="font-bold text-white">{selection.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-100/50">Entradas</span>
            <span className="font-bold text-white">
              {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
          {selection.items.map((item) => {
            const tt = eventData?.ticketTypes?.find(
              (t) => t.id === item.ticketTypeId,
            );
            return (
              <div
                key={item.ticketTypeId}
                className="flex justify-between pl-4 text-xs"
              >
                <span className="text-red-100/40">
                  {tt?.name || item.ticketTypeId.slice(0, 8) + '…'} × {item.quantity}
                </span>
                {tt && (
                  <span className="text-red-100/50">
                    {formatPrice(tt.price * item.quantity)}
                  </span>
                )}
              </div>
            );
          })}
          {totalPrice !== null && (
            <>
              <hr className="border-white/10" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-luxe-ember">
                  {loadingPrices ? (
                    <Loader2 className="inline h-4 w-4 animate-spin" />
                  ) : (
                    formatPrice(totalPrice)
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Formulario del comprador */}
        <div className="mt-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.15em] text-red-100/50">
            Datos del comprador
          </h2>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label
                htmlFor="buyerName"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-red-100/50"
              >
                Nombre completo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-100/30" />
                <input
                  id="buyerName"
                  type="text"
                  value={buyerName}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    if (formErrors.name) {
                      setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="Tu nombre completo"
                  className={`w-full rounded-xl border bg-luxe-black/60 py-3 pl-11 pr-4 text-sm text-white placeholder-red-100/30 shadow-lg backdrop-blur-xl transition focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-luxe-ember/50 focus:ring-luxe-ember/20'
                  }`}
                />
              </div>
              {formErrors.name && (
                <p className="mt-1.5 text-xs font-semibold text-red-400">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="buyerEmail"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-red-100/50"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-100/30" />
                <input
                  id="buyerEmail"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => {
                    setBuyerEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="tu@correo.com"
                  className={`w-full rounded-xl border bg-luxe-black/60 py-3 pl-11 pr-4 text-sm text-white placeholder-red-100/30 shadow-lg backdrop-blur-xl transition focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-luxe-ember/50 focus:ring-luxe-ember/20'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1.5 text-xs font-semibold text-red-400">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="buyerPhone"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-red-100/50"
              >
                Teléfono
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-100/30" />
                <input
                  id="buyerPhone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => {
                    setBuyerPhone(e.target.value);
                    if (formErrors.phone) {
                      setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder="+57 300 123 4567"
                  className={`w-full rounded-xl border bg-luxe-black/60 py-3 pl-11 pr-4 text-sm text-white placeholder-red-100/30 shadow-lg backdrop-blur-xl transition focus:outline-none focus:ring-2 ${
                    formErrors.phone
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-luxe-ember/50 focus:ring-luxe-ember/20'
                  }`}
                />
              </div>
              {formErrors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-red-400">
                  {formErrors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Errores generales */}
        {error && (
          <div
            className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Botón de pago */}
        <button
          onClick={handleProcessPurchase}
          disabled={processing}
          className="mt-6 w-full rounded-2xl border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember px-6 py-4 text-base font-black text-white shadow-2xl shadow-luxe-ember/25 transition hover:-translate-y-0.5 hover:from-luxe-wine hover:to-luxe-crimson disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <span className="inline-flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              Procesando…
            </span>
          ) : (
            'Continuar al pago'
          )}
        </button>

        <p className="mt-4 text-center text-xs text-red-100/40">
          Serás redirigido al entorno seguro de Bold para completar el pago.
        </p>
      </div>
    </main>
  );
}
