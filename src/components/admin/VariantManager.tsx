import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Trash2, Loader2, Wand2, X, Upload, Pencil, Check } from 'lucide-react';
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

// Inline stock editor (unchanged)
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

const VariantManager = ({ productId, productSlug }: VariantManagerProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const { colors, setColors, refetch: refetchColors } = useProductColors(productId);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1a1a1a');
  const [addingColor, setAddingColor] = useState(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editColorDraft, setEditColorDraft] = useState<{ name: string; hex: string }>({ name: '', hex: '#1a1a1a' });
  const [uploadingSwatchId, setUploadingSwatchId] = useState<string | null>(null);
  const [deleteColorId, setDeleteColorId] = useState<string | null>(null);
  const swatchInputRef = useRef<HTMLInputElement>(null);
  const [swatchUploadTarget, setSwatchUploadTarget] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    style: '',
    sku: '',
    stock_quantity: 0,
    price_adjustment: 0,
  });
  const { toast } = useToast();

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

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  // ---- Colors CRUD ----
  const addColor = async () => {
    if (!productId) {
      toast({ title: 'Save product first', variant: 'destructive' });
      return;
    }
    const name = newColorName.trim();
    if (!name) {
      toast({ title: 'Color name required', variant: 'destructive' });
      return;
    }
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Color already added' });
      return;
    }
    setAddingColor(true);
    const { data, error } = await supabase
      .from('product_colors' as never)
      .insert({
        product_id: productId,
        name,
        hex: newColorHex,
        position: colors.length,
      } as never)
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

  const startEditColor = (c: ProductColor) => {
    setEditingColorId(c.id);
    setEditColorDraft({ name: c.name, hex: c.hex });
  };

  const saveEditColor = async (id: string) => {
    const name = editColorDraft.name.trim();
    if (!name) return;
    const { error } = await supabase
      .from('product_colors' as never)
      .update({ name, hex: editColorDraft.hex } as never)
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update color', variant: 'destructive' });
      return;
    }
    setColors(colors.map((c) => (c.id === id ? { ...c, name, hex: editColorDraft.hex } : c)));
    setEditingColorId(null);
  };

  const removeColor = async (id: string) => {
    const inUse = variants.filter((v) => v.color_id === id).length;
    if (inUse > 0) {
      // Null out color_id on those variants (keep legacy color text)
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

  const triggerSwatchUpload = (colorId: string) => {
    setSwatchUploadTarget(colorId);
    swatchInputRef.current?.click();
  };

  const handleSwatchFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !swatchUploadTarget) return;
    const colorId = swatchUploadTarget;
    setSwatchUploadTarget(null);
    setUploadingSwatchId(colorId);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `colors/${productId}/${colorId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      const url = pub.publicUrl;
      const { error } = await supabase
        .from('product_colors' as never)
        .update({ swatch_image_url: url } as never)
        .eq('id', colorId);
      if (error) throw error;
      setColors(colors.map((c) => (c.id === colorId ? { ...c, swatch_image_url: url } : c)));
      toast({ title: 'Swatch image uploaded' });
    } catch {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingSwatchId(null);
    }
  };

  // Suggest hex from known color names
  useEffect(() => {
    const known = getColorHex(newColorName.trim());
    if (newColorName.trim() && known.startsWith('#')) {
      setNewColorHex(known);
    }
  }, [newColorName]);

  // ---- Variants ----
  const generateSku = (size: string, color: string) => {
    const slugPart = productSlug.slice(0, 8).toUpperCase().replace(/-/g, '');
    const sizePart = size.toUpperCase().slice(0, 3);
    const colorPart = color ? `-${color.toUpperCase().slice(0, 3)}` : '';
    return `${slugPart}-${sizePart}${colorPart}`;
  };

  const addVariant = async () => {
    if (!productId) {
      toast({ title: 'Save product first', description: 'Create the product before adding variants.', variant: 'destructive' });
      return;
    }

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

  const bulkGenerate = async () => {
    if (!productId) {
      toast({ title: 'Save product first', variant: 'destructive' });
      return;
    }

    const existing = new Set(
      variants.map((v) => `${v.size || ''}::${(v.color || '').toLowerCase()}`)
    );

    const rows: Array<{ product_id: string; size: string; color: string | null; color_id: string | null; sku: string; stock_quantity: number }> = [];

    if (colors.length === 0) {
      STANDARD_SIZES.forEach((size) => {
        const key = `${size}::`;
        if (!existing.has(key)) {
          rows.push({ product_id: productId, size, color: null, color_id: null, sku: generateSku(size, ''), stock_quantity: 0 });
        }
      });
    } else {
      STANDARD_SIZES.forEach((size) => {
        colors.forEach((c) => {
          const key = `${size}::${c.name.toLowerCase()}`;
          if (!existing.has(key)) {
            rows.push({ product_id: productId, size, color: c.name, color_id: c.id, sku: generateSku(size, c.name), stock_quantity: 0 });
          }
        });
      });
    }

    if (rows.length === 0) {
      toast({ title: 'All combinations exist' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.from('product_variants').insert(rows as never).select();
      if (error) throw error;
      setVariants((prev) => [...prev, ...((data || []) as Variant[])]);
      toast({ title: `${rows.length} variant${rows.length === 1 ? '' : 's'} generated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate variants', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Stock rollup per color
  const stockByColor = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((v) => {
      if (v.color_id) {
        map.set(v.color_id, (map.get(v.color_id) || 0) + v.stock_quantity);
      }
    });
    return map;
  }, [variants]);

  const variantCountByColor = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((v) => {
      if (v.color_id) map.set(v.color_id, (map.get(v.color_id) || 0) + 1);
    });
    return map;
  }, [variants]);

  const generateLabel = useMemo(
    () => (colors.length === 0 ? 'Generate S–XXL' : `Generate Size × Color (${STANDARD_SIZES.length * colors.length})`),
    [colors.length]
  );

  if (!productId) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Save the product first to add variants.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for swatch uploads */}
      <input
        ref={swatchInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSwatchFile}
        className="hidden"
      />

      {/* Colors panel */}
      <div className="space-y-4 border border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Colors ({colors.length})
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Stored per product
          </span>
        </div>

        {colors.length > 0 && (
          <div className="border border-border divide-y divide-border">
            {colors.map((c) => {
              const isEditing = editingColorId === c.id;
              const stock = stockByColor.get(c.id) || 0;
              const variantCount = variantCountByColor.get(c.id) || 0;
              return (
                <div key={c.id} className="flex items-center gap-3 p-2.5 bg-background">
                  {/* Swatch (image or hex) */}
                  <button
                    type="button"
                    onClick={() => triggerSwatchUpload(c.id)}
                    className="relative w-10 h-10 border border-border shrink-0 overflow-hidden group/swatch"
                    title="Upload swatch image"
                    style={{ backgroundColor: c.hex }}
                  >
                    {c.swatch_image_url && (
                      <img src={c.swatch_image_url} alt={c.name} className="w-full h-full object-cover" />
                    )}
                    {uploadingSwatchId === c.id ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </span>
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 group-hover/swatch:opacity-100 transition-opacity">
                        <Upload className="h-4 w-4 text-background" />
                      </span>
                    )}
                  </button>

                  {/* Name / hex */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editColorDraft.name}
                        onChange={(e) => setEditColorDraft({ ...editColorDraft, name: e.target.value })}
                        className="h-8 text-xs rounded-none flex-1"
                      />
                      <input
                        type="color"
                        value={editColorDraft.hex}
                        onChange={(e) => setEditColorDraft({ ...editColorDraft, hex: e.target.value })}
                        className="h-8 w-10 border border-border cursor-pointer bg-background"
                      />
                      <Button size="sm" variant="outline" className="h-8 rounded-none" onClick={() => saveEditColor(c.id)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 rounded-none" onClick={() => setEditingColorId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase">{c.hex}</div>
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">
                        {variantCount} variant{variantCount === 1 ? '' : 's'} · {stock} in stock
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditColor(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDeleteColorId(c.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add new color row */}
        <div className="flex items-center gap-2">
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
            placeholder="Color name (e.g. Black, Olive, Forest)"
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
            Add Color
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Typing a known color (Black, Navy, Olive…) auto-fills the hex. Click a swatch to upload a custom image (heathers, prints).
        </p>
      </div>

      {/* Variants header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Variants ({variants.length})
        </h3>
        <Button variant="outline" size="sm" onClick={bulkGenerate} disabled={saving} className="rounded-none">
          <Wand2 className="h-3.5 w-3.5 mr-2" />
          {generateLabel}
        </Button>
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
                return (
                  <TableRow key={v.id}>
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
                    <TableCell>{v.price_adjustment ? `+$${v.price_adjustment}` : '—'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDeleteConfirmId(v.id)}
                      >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={addVariant}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

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
