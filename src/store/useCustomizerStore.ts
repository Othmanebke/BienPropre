import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabaseClient';
import type {
  CustomizerState,
  ImageLayer,
  TextLayer,
  TShirtSize,
} from '@/types/shop.types';

// ------------------------------------
// State shape
// ------------------------------------
interface CustomizerStore extends CustomizerState {
  isUploading: boolean;
  uploadError: string | null;
}

// ------------------------------------
// Actions shape
// ------------------------------------
interface CustomizerActions {
  setColor: (hex: string) => void;
  setSize: (size: TShirtSize) => void;
  setQuantity: (qty: number) => void;

  // Text layer
  setTextContent: (text: string) => void;
  setTextColor: (color: string) => void;
  setTextFontSize: (fontSize: number) => void;
  setTextPosition: (x: number, y: number) => void;
  clearText: () => void;

  // Image layer
  uploadImage: (file: File) => Promise<void>;
  setImageScale: (scale: number) => void;
  setImagePosition: (x: number, y: number) => void;
  clearImage: () => void;

  // Global
  resetStudio: () => void;
}

// ------------------------------------
// Defaults
// ------------------------------------
const DEFAULT_TEXT_LAYER: TextLayer = {
  text: '',
  color: '#1A1A1A',
  fontSize: 24,
  x: 50,
  y: 50,
};

const INITIAL_STATE: CustomizerStore = {
  selectedColor: '#FFFFFF',
  selectedSize: 'M',
  textLayer: null,
  imageLayer: null,
  quantity: 1,
  isUploading: false,
  uploadError: null,
};

// ------------------------------------
// Store
// ------------------------------------
export const useCustomizerStore = create<CustomizerStore & CustomizerActions>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      setColor: (hex) => set({ selectedColor: hex }, false, 'setColor'),

      setSize: (size) => set({ selectedSize: size }, false, 'setSize'),

      setQuantity: (qty) =>
        set({ quantity: Math.max(1, qty) }, false, 'setQuantity'),

      // ---- Text layer ----
      setTextContent: (text) => {
        const current = get().textLayer ?? { ...DEFAULT_TEXT_LAYER };
        set(
          { textLayer: text.trim() === '' ? null : { ...current, text } },
          false,
          'setTextContent',
        );
      },

      setTextColor: (color) => {
        const current = get().textLayer;
        if (!current) return;
        set({ textLayer: { ...current, color } }, false, 'setTextColor');
      },

      setTextFontSize: (fontSize) => {
        const current = get().textLayer;
        if (!current) return;
        set(
          { textLayer: { ...current, fontSize: Math.max(8, Math.min(96, fontSize)) } },
          false,
          'setTextFontSize',
        );
      },

      setTextPosition: (x, y) => {
        const current = get().textLayer;
        if (!current) return;
        set({ textLayer: { ...current, x, y } }, false, 'setTextPosition');
      },

      clearText: () => set({ textLayer: null }, false, 'clearText'),

      // ---- Image layer ----
      uploadImage: async (file: File) => {
        set({ isUploading: true, uploadError: null }, false, 'uploadImage/start');

        try {
          const ext       = file.name.split('.').pop() ?? 'jpg';
          const timestamp = Date.now();
          const random    = Math.random().toString(36).slice(2, 8);
          const path      = `uploads/${timestamp}-${random}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('tshirt-custom-images')
            .upload(path, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('tshirt-custom-images').getPublicUrl(path);

          const current = get().imageLayer;

          const nextLayer: ImageLayer = {
            previewUrl: URL.createObjectURL(file),
            storagePath: path,
            publicUrl,
            scale: current?.scale ?? 1,
            x: current?.x ?? 50,
            y: current?.y ?? 50,
          };

          set({ imageLayer: nextLayer, isUploading: false }, false, 'uploadImage/success');
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Erreur lors de l\'upload de l\'image.';
          set({ isUploading: false, uploadError: message }, false, 'uploadImage/error');
        }
      },

      setImageScale: (scale) => {
        const current = get().imageLayer;
        if (!current) return;
        set(
          { imageLayer: { ...current, scale: Math.max(0.1, Math.min(3, scale)) } },
          false,
          'setImageScale',
        );
      },

      setImagePosition: (x, y) => {
        const current = get().imageLayer;
        if (!current) return;
        set({ imageLayer: { ...current, x, y } }, false, 'setImagePosition');
      },

      clearImage: () => set({ imageLayer: null }, false, 'clearImage'),

      // ---- Global ----
      resetStudio: () => set({ ...INITIAL_STATE }, false, 'resetStudio'),
    }),
    { name: 'CustomizerStore' },
  ),
);
