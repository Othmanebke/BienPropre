import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  Palette,
  Type,
  ImagePlus,
  Plus,
  Minus,
  Trash2,
  Upload,
  Loader2,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { useCartStore } from '@/store/useCartStore';
import type { Product, CartItem, TShirtSize } from '@/types/shop.types';
import { COLOR_SWATCHES, T_SHIRT_SIZES } from '@/types/shop.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TShirtCanvas } from './TShirtCanvas';

// ─── Section wrapper ──────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-900">
        {icon && <span className="text-brand-600">{icon}</span>}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Slider row ───────────────────────────────────────────────────
function SliderRow({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  display,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 shrink-0 text-xs text-gray-500">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="flex-1 accent-brand-600"
      />
      <span className="w-10 text-right text-xs tabular-nums text-gray-400">
        {display ?? value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
interface CustomizerStudioProps {
  product: Product;
}

export function CustomizerStudio({ product }: CustomizerStudioProps) {
  const store      = useCustomizerStore();
  const { addItem, openCart } = useCartStore();
  const fileInputRef           = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Customization adds a €3 fee if any layer is present
  const customizationFee = store.textLayer !== null || store.imageLayer !== null ? 3 : 0;
  const unitPrice        = product.base_price + customizationFee;
  const lineTotal        = unitPrice * store.quantity;

  // ── Add to cart ──────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    const item: CartItem = {
      cartItemId:      crypto.randomUUID(),
      product,
      quantity:        store.quantity,
      size:            store.selectedSize,
      color:           store.selectedColor,
      customText:      store.textLayer?.text.trim() ?? null,
      customImageUrl:  store.imageLayer?.publicUrl  ?? null,
      unitPrice,
    };
    addItem(item);
    openCart();
    store.resetStudio();
  }, [store, product, unitPrice, addItem, openCart]);

  // ── File handling ─────────────────────────────────────────────────
  const processFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        // Size guard (5 MB)
        return;
      }
      void store.uploadImage(file);
    },
    [store],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processFile(e.target.files?.[0]);
      // Reset input so the same file can be re-selected after clearing
      e.target.value = '';
    },
    [processFile],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ═══════════════════════════════════════════════════════
          LEFT — T-shirt canvas
      ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">
        <div className="w-full max-w-xs bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-inner">
          <TShirtCanvas
            color={store.selectedColor}
            textLayer={store.textLayer}
            imageLayer={store.imageLayer}
          />
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          La zone délimitée (tirets) représente la surface d&apos;impression.
        </p>

        <button
          onClick={store.resetStudio}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <RefreshCw className="w-3 h-3" />
          Réinitialiser le studio
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT — Controls
      ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">

        {/* ── Couleur ── */}
        <Section title="Couleur du t-shirt" icon={<Palette className="w-4 h-4" />}>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                title={swatch.label}
                aria-label={`Couleur: ${swatch.label}`}
                aria-pressed={store.selectedColor === swatch.hex}
                onClick={() => store.setColor(swatch.hex)}
                className={[
                  'h-8 w-8 rounded-full border-2 transition-all duration-150',
                  store.selectedColor === swatch.hex
                    ? 'border-brand-500 ring-2 ring-brand-300 ring-offset-1 scale-110'
                    : 'border-gray-200 hover:scale-105',
                  swatch.hex === '#FFFFFF' ? 'shadow-sm' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
        </Section>

        {/* ── Taille ── */}
        <Section title="Taille">
          <div className="mt-3 flex flex-wrap gap-2">
            {T_SHIRT_SIZES.map((size: TShirtSize) => (
              <button
                key={size}
                type="button"
                aria-pressed={store.selectedSize === size}
                onClick={() => store.setSize(size)}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  store.selectedSize === size
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {size}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Quantité ── */}
        <Section title="Quantité">
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={store.quantity <= 1}
              onClick={() => store.setQuantity(store.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-8 text-center text-lg font-semibold tabular-nums">
              {store.quantity}
            </span>

            <button
              type="button"
              onClick={() => store.setQuantity(store.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-brand-400 transition-colors"
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </Section>

        {/* ── Texte personnalisé ── */}
        <Section title="Texte personnalisé" icon={<Type className="w-4 h-4" />}>
          <div className="mt-3 flex flex-col gap-3">
            <Input
              placeholder="Votre inscription… (max 40 caractères)"
              value={store.textLayer?.text ?? ''}
              onChange={(e) => store.setTextContent(e.target.value)}
              maxLength={40}
              aria-label="Texte à imprimer sur le t-shirt"
            />

            {store.textLayer !== null && (
              <>
                {/* Colour picker */}
                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-xs text-gray-500">Couleur</label>
                  <input
                    type="color"
                    value={store.textLayer.color}
                    onChange={(e) => store.setTextColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-gray-200 p-0.5"
                    title="Couleur du texte"
                  />
                  <span
                    className="font-mono text-xs"
                    style={{ color: store.textLayer.color }}
                  >
                    {store.textLayer.color}
                  </span>
                </div>

                {/* Font size */}
                <SliderRow
                  label="Taille police"
                  min={8}
                  max={32}
                  value={store.textLayer.fontSize}
                  onChange={store.setTextFontSize}
                  display={`${store.textLayer.fontSize}pt`}
                />

                {/* Position X */}
                <SliderRow
                  label="Position X"
                  min={10}
                  max={90}
                  value={store.textLayer.x}
                  onChange={(v) => {
                    const tl = store.textLayer;
                    if (tl) store.setTextPosition(v, tl.y);
                  }}
                  display={`${store.textLayer.x}%`}
                />

                {/* Position Y */}
                <SliderRow
                  label="Position Y"
                  min={10}
                  max={90}
                  value={store.textLayer.y}
                  onChange={(v) => {
                    const tl = store.textLayer;
                    if (tl) store.setTextPosition(tl.x, v);
                  }}
                  display={`${store.textLayer.y}%`}
                />

                <button
                  type="button"
                  onClick={store.clearText}
                  className="flex items-center gap-1.5 self-start text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Effacer le texte
                </button>
              </>
            )}
          </div>
        </Section>

        {/* ── Votre image / design ── */}
        <Section title="Votre image / design" icon={<ImagePlus className="w-4 h-4" />}>
          <div className="mt-3">

            {/* ── État : image présente ── */}
            {store.imageLayer !== null ? (
              <div className="flex flex-col gap-3">
                {/* Thumbnail + status */}
                <div className="flex items-center gap-3">
                  <img
                    src={store.imageLayer.previewUrl}
                    alt="Aperçu du design uploadé"
                    className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 object-contain"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-800">Design uploadé</p>
                    {store.isUploading && (
                      <span className="flex items-center gap-1 text-xs text-brand-600">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Envoi en cours…
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-left text-xs text-brand-600 hover:underline"
                    >
                      Changer l&apos;image
                    </button>
                  </div>
                </div>

                {/* Scale */}
                <SliderRow
                  label="Échelle"
                  min={0.3}
                  max={2}
                  step={0.05}
                  value={store.imageLayer.scale}
                  onChange={store.setImageScale}
                  display={`×${store.imageLayer.scale.toFixed(2)}`}
                />

                {/* Position X */}
                <SliderRow
                  label="Position X"
                  min={10}
                  max={90}
                  value={store.imageLayer.x}
                  onChange={(v) => {
                    const il = store.imageLayer;
                    if (il) store.setImagePosition(v, il.y);
                  }}
                  display={`${store.imageLayer.x}%`}
                />

                {/* Position Y */}
                <SliderRow
                  label="Position Y"
                  min={10}
                  max={90}
                  value={store.imageLayer.y}
                  onChange={(v) => {
                    const il = store.imageLayer;
                    if (il) store.setImagePosition(il.x, v);
                  }}
                  display={`${store.imageLayer.y}%`}
                />

                <button
                  type="button"
                  onClick={store.clearImage}
                  className="flex items-center gap-1.5 self-start text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer l&apos;image
                </button>
              </div>

            ) : (
              /* ── État : zone de dépôt ── */
              <div
                role="button"
                tabIndex={0}
                aria-label="Zone d'upload — glissez une image ou cliquez pour parcourir"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={[
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6',
                  'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                  isDragOver
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-gray-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {store.isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
                ) : (
                  <Upload className="w-7 h-7 text-gray-400" />
                )}
                <p className="text-center text-sm text-gray-500">
                  {store.isUploading
                    ? 'Upload en cours…'
                    : 'Glissez une image ici ou cliquez pour parcourir'}
                </p>
                <p className="text-xs text-gray-400">PNG · JPG · SVG · WEBP — 5 Mo max</p>
              </div>
            )}

            {/* Upload error */}
            {store.uploadError !== null && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
                {store.uploadError}
              </p>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={handleFileInput}
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════════
            CTA — sticky bottom bar
        ═══════════════════════════════════════════════════════ */}
        <div className="sticky bottom-0 -mx-1 mt-2 border-t border-gray-100 bg-white/90 px-1 pb-2 pt-3 backdrop-blur-sm">
          {customizationFee > 0 && (
            <p className="mb-1 text-right text-xs text-gray-400">
              Base&nbsp;
              <span className="font-medium text-gray-600">
                {product.base_price.toFixed(2)}&nbsp;€
              </span>
              &nbsp;+&nbsp;personnalisation&nbsp;
              <span className="font-medium text-gray-600">
                {customizationFee.toFixed(2)}&nbsp;€
              </span>
            </p>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={store.isUploading}
            leftIcon={<ShoppingCart className="w-5 h-5" />}
          >
            Ajouter au panier&nbsp;—&nbsp;
            {lineTotal.toFixed(2)}&nbsp;€
          </Button>
        </div>

      </div>
    </div>
  );
}
