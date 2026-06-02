import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Plus, Trash2, Loader2, Wand2, X } from 'lucide-react';
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

// Inline stock editor component
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
  style: string | null;
  sku: string | null;
  stock_quantity: number;
  price_adjustment: number | null;
  product_id: string;
}

interface ColorEntry {
  name: string;
  hex: string;
}

interface VariantManagerProps {
  productId: string | null;
  productSlug: string;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const VariantManager = ({ productId, productSlug }: VariantManagerProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1a1a1a');
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
      const rows = data || [];
      setVariants(rows);

      // Derive color list from existing variants (preserve insertion order)
      setColors((prev) => {
        const seen = new Map<string, ColorEntry>();
        prev.forEach((c) => seen.set(c.name.toLowerCase(), c));
        rows.forEach((v) => {
          if (v.color) {
            const key = v.color.toLowerCase();
            if (!seen.has(key)) {
              seen.set(key, { name: v.color, hex: getColorHex(v.color) });
            }
          }
        });
        return Array.from(seen.values());
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to load variants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const generateSku = (size: string, color: string) => {
    const slugPart = productSlug.slice(0, 8).toUpperCase().replace(/-/g, '');
    const sizePart = size.toUpperCase().slice(0, 3);
    const colorPart = color ? `-${color.toUpperCase().slice(0, 3)}` : '';
    return `${slugPart}-${sizePart}${colorPart}`;
  };

  const addColor = () => {
    const name = newColorName.trim();
    if (!name) {
      toast({ title: 'Color name required', variant: 'destructive' });
      return;
    }
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Color already added' });
      return;
    }
    setColors([...colors, { name, hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#1a1a1a');
  };

  const removeColor = (name: string) => {
    setColors(colors.filter((c) => c.name.toLowerCase() !== name.toLowerCase()));
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
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          size: newVariant.size || null,
          color: newVariant.color || null,
          style: newVariant.style || null,
          sku,
          stock_quantity: newVariant.stock_quantity,
          price_adjustment: newVariant.price_adjustment || null,
        })
        .select()
        .single();

      if (error) throw error;
      setVariants((prev) => [...prev, data]);
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
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

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

    const rows: Array<{ product_id: string; size: string; color: string | null; sku: string; stock_quantity: number }> = [];

    if (colors.length === 0) {
      // Size-only generation (legacy behavior)
      STANDARD_SIZES.forEach((size) => {
        const key = `${size}::`;
        if (!existing.has(key)) {
          rows.push({
            product_id: productId,
            size,
            color: null,
            sku: generateSku(size, ''),
            stock_quantity: 0,
          });
        }
      });
    } else {
      // Size × Color cross product
      STANDARD_SIZES.forEach((size) => {
        colors.forEach((c) => {
          const key = `${size}::${c.name.toLowerCase()}`;
          if (!existing.has(key)) {
            rows.push({
              product_id: productId,
              size,
              color: c.name,
              sku: generateSku(size, c.name),
              stock_quantity: 0,
            });
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
      const { data, error } = await supabase
        .from('product_variants')
        .insert(rows)
        .select();

      if (error) throw error;
      setVariants((prev) => [...prev, ...(data || [])]);
      toast({ title: `${rows.length} variant${rows.length === 1 ? '' : 's'} generated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate variants', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
      {/* Colors panel */}
      <div className="space-y-3 border border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Colors ({colors.length})
          </h3>
        </div>

        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-2 border border-border pl-2 pr-1 py-1"
              >
                <span
                  className="inline-block w-4 h-4 border border-border"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden
                />
                <span className="text-xs">{c.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(c.name)}
                  className="h-5 w-5 inline-flex items-center justify-center hover:bg-secondary"
                  aria-label={`Remove ${c.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
            placeholder="Color name (e.g. Black)"
            className="h-8 text-xs rounded-none flex-1"
          />
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="h-8 w-12 border border-border cursor-pointer bg-background"
            aria-label="Pick color"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addColor}
            className="h-8 rounded-none"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Color
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Colors are used when generating variants and as quick-pick options below.
        </p>
      </div>

      {/* Variants */}
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
                const swatch = v.color
                  ? colors.find((c) => c.name.toLowerCase() === v.color!.toLowerCase())?.hex || getColorHex(v.color)
                  : null;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.size || '—'}</TableCell>
                    <TableCell>
                      {v.color ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 border border-border"
                            style={{ backgroundColor: swatch || '#ccc' }}
                            aria-hidden
                          />
                          {v.color}
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
                          <SelectItem key={c.name} value={c.name}>
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
    </div>
  );
};

export default VariantManager;
