import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Loader2,
  Wand2,
  Upload,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getColorHex } from '@/lib/cartUtils';
import { useProductColors, ProductColor } from '@/hooks/useProductColors';

// ────────────────────────────────────────────────────────────────────
// Inline stock editor
// ────────────────────────────────────────────────────────────────────
const InlineStockEdit = ({ variantId, value, onSave }: { variantId: string; value: number; onSave: (v: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(value);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    if (qty === value) { setEditing(false); return; }
    setSaving(true);
    const { error } = await supabase.from('product_variants').update({ stock_quantity: qty }).eq('id', variantId);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
      setQty(value);
    } else {
      onSave(qty);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        type="number"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value) || 0)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setQty(value); setEditing(false); } }}
        className="h-7 w-16 text-xs rounded-none"
        autoFocus
        disabled={saving}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm hover:bg-secondary px-2 py-0.5 cursor-pointer transition-colors"
      title="Click to edit stock"
    >
      {value}
    </button>
  );
};

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  color_id?: string | null;
  style: string | null;
  sku: string | null;
  stock_quantity: number;
  price_adjustment: number | null;
  product_id: string;
}

interface VariantManagerProps {
  productId: string | null;
  productSlug: string;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// ────────────────────────────────────────────────────────────────────
// ColorTile — Temu-style swatch card
// ────────────────────────────────────────────────────────────────────
interface ColorTileProps {
  color: ProductColor;
  variantCount: number;
  stock: number;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<ProductColor>) => void;
  onUploadImage: () => void;
  onRemoveImage: () => void;
  onDropImage: (file: File) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onGenerateSizes: () => void;
  uploading: boolean;
}

const ColorTile = ({
  color, variantCount, stock, isFirst, isLast,
  onPatch, onUploadImage, onRemoveImage, onDropImage,
  onMove, onDelete, onGenerateSizes, uploading,
}: ColorTileProps) => {
  const [name, setName] = useState(color.name);
  const [hex, setHex] = useState(color.hex);
  const [dragOver, setDragOver] = useState(false);
  const hexDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setName(color.name), [color.name]);
  useEffect(() => setHex(color.hex), [color.hex]);

  const commitName = () => {
    const next = name.trim();
    if (!next || next === color.name) { setName(color.name); return; }
    onPatch({ name: next });
  };

  const handleHex = (next: string) => {
    setHex(next);
    if (hexDebounce.current) clearTimeout(hexDebounce.current);
    hexDebounce.current = setTimeout(() => onPatch({ hex: next }), 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onDropImage(file);
  };

  return (
    <div className="group border border-border bg-background flex flex-col">
      {/* Swatch surface — click to pick color, drop to upload image */}
      <label
        className={`relative block aspect-square cursor-pointer overflow-hidden border-b border-border ${dragOver ? 'ring-2 ring-foreground ring-offset-0' : ''}`}
        style={{ backgroundColor: hex }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {color.swatch_image_url && (
          <img
            src={color.swatch_image_url}
            alt={color.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        {/* Hidden native color picker covers full tile */}
        <input
          type="color"
          value={hex}
          onChange={(e) => handleHex(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`Pick color for ${color.name}`}
        />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
        )}
        {/* Reorder controls top-left */}
        <div className="absolute top-1 left-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(-1); }}
            disabled={isFirst}
            className="h-5 w-5 grid place-items-center bg-background/90 border border-border disabled:opacity-30"
            aria-label="Move left"
          >
            <ArrowUp className="h-3 w-3 -rotate-90" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(1); }}
            disabled={isLast}
            className="h-5 w-5 grid place-items-center bg-background/90 border border-border disabled:opacity-30"
            aria-label="Move right"
          >
            <ArrowDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
        {/* Variant warning chip */}
        {variantCount === 0 && (
          <span className="absolute bottom-1 left-1 right-1 text-[9px] uppercase tracking-wider bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 text-center">
            No variants
          </span>
        )}
      </label>

      {/* Meta */}
      <div className="p-2 space-y-1.5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') { setName(color.name); (e.target as HTMLInputElement).blur(); }
          }}
          className="h-7 text-xs font-medium rounded-none border-transparent hover:border-border focus-visible:border-border px-1.5"
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase px-1.5">
          <span>{hex}</span>
          <span className="font-sans normal-case">
            {variantCount} var · {stock} stk
          </span>
        </div>

        {variantCount === 0 && (
          <button
            type="button"
            onClick={onGenerateSizes}
            className="w-full text-[10px] uppercase tracking-wider py-1 bg-secondary hover:bg-secondary/70 transition-colors"
          >
            + Generate S–XXL
          </button>
        )}

        <div className="flex items-center gap-1 pt-0.5">
          <button
            type="button"
            onClick={onUploadImage}
            className="flex-1 h-7 grid place-items-center bg-secondary/60 hover:bg-secondary transition-colors"
            title="Upload swatch image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          {color.swatch_image_url && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="h-7 px-2 grid place-items-center bg-secondary/60 hover:bg-secondary transition-colors"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="h-7 px-2 grid place-items-center bg-secondary/60 hover:bg-destructive/10 transition-colors"
            title="Delete color"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// VariantManager
// ────────────────────────────────────────────────────────────────────
const VariantManager = ({ productId, productSlug }: VariantManagerProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const { colors, setColors } = useProductColors(productId);

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1a1a1a');
  const [addingColor, setAddingColor] = useState(false);

  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasting, setPasting] = useState(false);

  const [uploadingSwatchId, setUploadingSwatchId] = useState<string | null>(null);
  const [deleteColorId, setDeleteColorId] = useState<string | null>(null);
  const swatchInputRef = useRef<HTMLInputElement>(null);
  const [swatchUploadTarget, setSwatchUploadTarget] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    size: '', color: '', style: '', sku: '', stock_quantity: 0, price_adjustment: 0,
  });
  const { toast } = useToast();

  // ── Variants fetch ───────────────────────────────────────────────
  const fetchVariants = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setVariants((data || []) as Variant[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load variants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  // Suggest hex from known names
  useEffect(() => {
    const known = getColorHex(newColorName.trim());
    if (newColorName.trim() && known.startsWith('#')) setNewColorHex(known);
  }, [newColorName]);

  // ── Color CRUD ───────────────────────────────────────────────────
  const addColor = async () => {
    if (!productId) { toast({ title: 'Save product first', variant: 'destructive' }); return; }
    const name = newColorName.trim();
    if (!name) { toast({ title: 'Color name required', variant: 'destructive' }); return; }
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Color already added' }); return;
    }
    setAddingColor(true);
    const { data, error } = await supabase
      .from('product_colors' as never)
      .insert({ product_id: productId, name, hex: newColorHex, position: colors.length } as never)
      .select()
      .single();
    setAddingColor(false);
    if (error || !data) {
      toast({ title: 'Error', description: 'Failed to add color', variant: 'destructive' });
      return;
    }
    setColors([...colors, data as unknown as ProductColor]);
    setNewColorName('');
    setNewColorHex('#1a1a1a');
  };

  const patchColor = async (id: string, patch: Partial<ProductColor>) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const { error } = await supabase
      .from('product_colors' as never)
      .update(patch as never)
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to save color', variant: 'destructive' });
    }
  };

  const moveColor = async (id: string, dir: -1 | 1) => {
    const idx = colors.findIndex((c) => c.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= colors.length) return;
    const next = [...colors];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const reindexed = next.map((c, i) => ({ ...c, position: i }));
    setColors(reindexed);
    await Promise.all(
      reindexed.map((c) =>
        supabase.from('product_colors' as never).update({ position: c.position } as never).eq('id', c.id)
      )
    );
  };

  const removeColor = async (id: string) => {
    const inUse = variants.filter((v) => v.color_id === id).length;
    if (inUse > 0) {
      await supabase.from('product_variants').update({ color_id: null } as never).eq('color_id', id);
    }
    const { error } = await supabase.from('product_colors' as never).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete color', variant: 'destructive' });
      return;
    }
    setColors(colors.filter((c) => c.id !== id));
    fetchVariants();
  };

  // ── Swatch image upload (click-to-pick + drag-drop) ──────────────
  const triggerSwatchUpload = (colorId: string) => {
    setSwatchUploadTarget(colorId);
    swatchInputRef.current?.click();
  };

  const uploadSwatchFile = async (colorId: string, file: File) => {
    setUploadingSwatchId(colorId);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `colors/${productId}/${colorId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      await patchColor(colorId, { swatch_image_url: pub.publicUrl });
      toast({ title: 'Swatch image uploaded' });
    } catch {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingSwatchId(null);
    }
  };

  const handleSwatchFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !swatchUploadTarget) return;
    const target = swatchUploadTarget;
    setSwatchUploadTarget(null);
    await uploadSwatchFile(target, file);
  };

  // ── Paste-list ───────────────────────────────────────────────────
  const pasteColors = async () => {
    if (!productId) return;
    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { setPasteOpen(false); return; }
    setPasting(true);
    const existing = new Set(colors.map((c) => c.name.toLowerCase()));
    const rows: Array<{ product_id: string; name: string; hex: string; position: number }> = [];
    let pos = colors.length;
    for (const line of lines) {
      const match = line.match(/^(.+?)(?:\s+(#[0-9a-fA-F]{6}))?$/);
      if (!match) continue;
      const name = match[1].trim();
      if (!name || existing.has(name.toLowerCase())) continue;
      const fallback = getColorHex(name);
      const hex = match[2] || (fallback.startsWith('#') ? fallback : '#1a1a1a');
      rows.push({ product_id: productId, name, hex, position: pos++ });
      existing.add(name.toLowerCase());
    }
    if (rows.length === 0) {
      toast({ title: 'Nothing to add' });
      setPasting(false); setPasteOpen(false); return;
    }
    const { data, error } = await supabase
      .from('product_colors' as never)
      .insert(rows as never)
      .select();
    setPasting(false);
    if (error || !data) {
      toast({ title: 'Error', description: 'Paste failed', variant: 'destructive' });
      return;
    }
    setColors([...colors, ...(data as unknown as ProductColor[])]);
    toast({ title: `${rows.length} color${rows.length === 1 ? '' : 's'} added` });
    setPasteText('');
    setPasteOpen(false);
  };

  // ── Variants ─────────────────────────────────────────────────────
  const generateSku = (size: string, color: string) => {
    const slugPart = productSlug.slice(0, 8).toUpperCase().replace(/-/g, '');
    const sizePart = size.toUpperCase().slice(0, 3);
    const colorPart = color ? `-${color.toUpperCase().slice(0, 3)}` : '';
    return `${slugPart}-${sizePart}${colorPart}`;
  };

  const addVariant = async () => {
    if (!productId) { toast({ title: 'Save product first', variant: 'destructive' }); return; }
    if (!newVariant.size && !newVariant.color && !newVariant.style) {
      toast({ title: 'Missing info', description: 'Enter at least a size, color, or style.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const sku = newVariant.sku || generateSku(newVariant.size, newVariant.color);
      const colorRecord = colors.find((c) => c.name.toLowerCase() === newVariant.color.toLowerCase());
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          size: newVariant.size || null,
          color: newVariant.color || null,
          color_id: colorRecord?.id || null,
          style: newVariant.style || null,
          sku,
          stock_quantity: newVariant.stock_quantity,
          price_adjustment: newVariant.price_adjustment || null,
        } as never)
        .select()
        .single();
      if (error) throw error;
      setVariants((prev) => [...prev, data as Variant]);
      setNewVariant({ size: '', color: '', style: '', sku: '', stock_quantity: 0, price_adjustment: 0 });
      toast({ title: 'Variant added' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add variant', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteVariant = async (id: string) => {
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete variant', variant: 'destructive' });
    }
  };

  const insertVariantRows = async (rows: Array<{ size: string; color: string | null; color_id: string | null }>) => {
    if (rows.length === 0 || !productId) return 0;
    const existing = new Set(variants.map((v) => `${v.size || ''}::${(v.color || '').toLowerCase()}`));
    const filtered = rows
      .filter((r) => !existing.has(`${r.size}::${(r.color || '').toLowerCase()}`))
      .map((r) => ({
        product_id: productId,
        size: r.size,
        color: r.color,
        color_id: r.color_id,
        sku: generateSku(r.size, r.color || ''),
        stock_quantity: 0,
      }));
    if (filtered.length === 0) {
      toast({ title: 'All combinations exist' });
      return 0;
    }
    setSaving(true);
    const { data, error } = await supabase.from('product_variants').insert(filtered as never).select();
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to generate variants', variant: 'destructive' });
      return 0;
    }
    setVariants((prev) => [...prev, ...((data || []) as Variant[])]);
    return filtered.length;
  };

  const bulkGenerate = async () => {
    if (!productId) { toast({ title: 'Save product first', variant: 'destructive' }); return; }
    const rows = colors.length === 0
      ? STANDARD_SIZES.map((size) => ({ size, color: null, color_id: null }))
      : STANDARD_SIZES.flatMap((size) =>
          colors.map((c) => ({ size, color: c.name, color_id: c.id }))
        );
    const count = await insertVariantRows(rows);
    if (count > 0) toast({ title: `${count} variant${count === 1 ? '' : 's'} generated` });
  };

  const generateForColor = async (c: ProductColor) => {
    const rows = STANDARD_SIZES.map((size) => ({ size, color: c.name, color_id: c.id }));
    const count = await insertVariantRows(rows);
    if (count > 0) toast({ title: `${count} variant${count === 1 ? '' : 's'} generated for ${c.name}` });
  };

  // ── Rollups ──────────────────────────────────────────────────────
  const stockByColor = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((v) => { if (v.color_id) map.set(v.color_id, (map.get(v.color_id) || 0) + v.stock_quantity); });
    return map;
  }, [variants]);

  const variantCountByColor = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((v) => { if (v.color_id) map.set(v.color_id, (map.get(v.color_id) || 0) + 1); });
    return map;
  }, [variants]);

  const generatePreview = useMemo(() => {
    const total = colors.length === 0 ? STANDARD_SIZES.length : STANDARD_SIZES.length * colors.length;
    const existing = new Set(variants.map((v) => `${v.size || ''}::${(v.color || '').toLowerCase()}`));
    let willCreate = 0;
    if (colors.length === 0) {
      STANDARD_SIZES.forEach((s) => { if (!existing.has(`${s}::`)) willCreate++; });
    } else {
      STANDARD_SIZES.forEach((s) => colors.forEach((c) => {
        if (!existing.has(`${s}::${c.name.toLowerCase()}`)) willCreate++;
      }));
    }
    return { total, willCreate };
  }, [colors, variants]);

  if (!productId) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Save the product first to add variants.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={swatchInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSwatchFile}
        className="hidden"
      />

      {/* COLORS PANEL */}
      <div className="space-y-4 border border-border p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Colors ({colors.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasteOpen(true)}
              className="h-8 rounded-none text-xs"
            >
              <ClipboardPaste className="h-3.5 w-3.5 mr-1.5" />
              Paste list
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={bulkGenerate}
              disabled={saving || generatePreview.willCreate === 0}
              className="h-8 rounded-none text-xs"
              title={`${generatePreview.willCreate} new of ${generatePreview.total} total`}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Generate {generatePreview.willCreate > 0 ? `(${generatePreview.willCreate})` : ''}
            </Button>
          </div>
        </div>

        {colors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {colors.map((c, i) => (
              <ColorTile
                key={c.id}
                color={c}
                variantCount={variantCountByColor.get(c.id) || 0}
                stock={stockByColor.get(c.id) || 0}
                isFirst={i === 0}
                isLast={i === colors.length - 1}
                uploading={uploadingSwatchId === c.id}
                onPatch={(p) => patchColor(c.id, p)}
                onUploadImage={() => triggerSwatchUpload(c.id)}
                onRemoveImage={() => patchColor(c.id, { swatch_image_url: null })}
                onDropImage={(f) => uploadSwatchFile(c.id, f)}
                onMove={(d) => moveColor(c.id, d)}
                onDelete={() => setDeleteColorId(c.id)}
                onGenerateSizes={() => generateForColor(c)}
              />
            ))}
          </div>
        )}

        {/* Add color row */}
        <div className="flex items-center gap-2">
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
            placeholder="Color name (Black, Forest, Bone…)"
            className="h-9 text-xs rounded-none flex-1"
          />
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="h-9 w-12 border border-border cursor-pointer bg-background"
            aria-label="Pick color"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addColor}
            disabled={addingColor}
            className="h-9 rounded-none"
          >
            {addingColor ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            Add
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Click any swatch to change its hex · drop an image onto a tile to upload a texture · drag arrows reorder · auto-hex on known names.
        </p>
      </div>

      {/* VARIANTS TABLE */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Variants ({variants.length})
        </h3>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-none overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Size</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Color</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Style</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">SKU</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Stock</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Price Adj.</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => {
                const colorRecord = v.color_id
                  ? colors.find((c) => c.id === v.color_id)
                  : v.color
                    ? colors.find((c) => c.name.toLowerCase() === v.color!.toLowerCase())
                    : null;
                const swatch = colorRecord?.hex || (v.color ? getColorHex(v.color) : null);
                const tint = colorRecord?.hex ? `${colorRecord.hex}10` : undefined; // 6% opacity in hex8
                return (
                  <TableRow key={v.id} style={tint ? { backgroundColor: tint } : undefined}>
                    <TableCell className="font-medium">{v.size || '—'}</TableCell>
                    <TableCell>
                      {v.color ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 border border-border overflow-hidden"
                            style={{ backgroundColor: swatch || '#ccc' }}
                            aria-hidden
                          >
                            {colorRecord?.swatch_image_url && (
                              <img src={colorRecord.swatch_image_url} alt="" className="w-full h-full object-cover" />
                            )}
                          </span>
                          {v.color}
                          {!v.color_id && colorRecord && (
                            <span className="text-[9px] uppercase text-muted-foreground">(unlinked)</span>
                          )}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{v.style || '—'}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{v.sku || '—'}</TableCell>
                    <TableCell>
                      <InlineStockEdit
                        variantId={v.id}
                        value={v.stock_quantity}
                        onSave={(newQty) => {
                          setVariants((prev) => prev.map((x) => x.id === v.id ? { ...x, stock_quantity: newQty } : x));
                        }}
                      />
                    </TableCell>
                    <TableCell>{v.price_adjustment ? `+$${v.price_adjustment} CAD` : '—'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteConfirmId(v.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Add variant row */}
              <TableRow className="bg-secondary/30">
                <TableCell>
                  <Input
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    placeholder="S"
                    className="h-8 text-xs rounded-none"
                  />
                </TableCell>
                <TableCell>
                  {colors.length > 0 ? (
                    <Select
                      value={newVariant.color || '__none__'}
                      onValueChange={(val) => setNewVariant({ ...newVariant, color: val === '__none__' ? '' : val })}
                    >
                      <SelectTrigger className="h-8 text-xs rounded-none">
                        <SelectValue placeholder="Pick" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        {colors.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 border border-border"
                                style={{ backgroundColor: c.hex }}
                                aria-hidden
                              />
                              {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      placeholder="Black"
                      className="h-8 text-xs rounded-none"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.style}
                    onChange={(e) => setNewVariant({ ...newVariant, style: e.target.value })}
                    placeholder="Classic"
                    className="h-8 text-xs rounded-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    placeholder="Auto"
                    className="h-8 text-xs font-mono rounded-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newVariant.stock_quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs w-16 rounded-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newVariant.price_adjustment}
                    onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs w-20 rounded-none"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addVariant} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paste list dialog */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xs uppercase tracking-wider">Paste color list</DialogTitle>
            <DialogDescription className="text-xs">
              One color per line. Optional hex after a space.
              <br />
              <code className="text-[11px] font-mono">Forest #1F3A2E</code> · <code className="text-[11px] font-mono">Bone</code> (auto-hex)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={`Forest #1F3A2E\nBone #EFE7D8\nOnyx`}
            className="font-mono text-xs rounded-none"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasteOpen(false)} className="rounded-none">Cancel</Button>
            <Button onClick={pasteColors} disabled={pasting} className="rounded-none">
              {pasting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
              Add colors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const v = variants.find((x) => x.id === deleteConfirmId);
                const label = v ? [v.size, v.color].filter(Boolean).join(' / ') || 'Default' : '';
                return `Delete variant "${label}"? Its SKU, stock count, and price adjustment will be lost.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteConfirmId) deleteVariant(deleteConfirmId); setDeleteConfirmId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteColorId} onOpenChange={() => setDeleteColorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const c = colors.find((x) => x.id === deleteColorId);
                const inUse = c ? variants.filter((v) => v.color_id === c.id).length : 0;
                return `Delete "${c?.name}"? ${inUse > 0 ? `${inUse} variant${inUse === 1 ? '' : 's'} will be unlinked (but kept).` : 'No variants reference this color.'}`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteColorId) removeColor(deleteColorId); setDeleteColorId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VariantManager;
