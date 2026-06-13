import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductStyles, ProductStyle } from '@/hooks/useProductStyles';

interface StyleManagerProps {
  productId: string | null;
}

/**
 * Admin CRUD for garment styles (Hoodie / T-Shirt / Crewneck …).
 * Mirrors the simpler half of the color manager: name + optional label +
 * optional icon + optional price delta + reorder + delete.
 */
const StyleManager = ({ productId }: StyleManagerProps) => {
  const { styles, setStyles, refetch } = useProductStyles(productId);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addStyle = async () => {
    if (!productId) {
      toast({ title: 'Save product first', variant: 'destructive' });
      return;
    }
    const name = newName.trim();
    if (!name) return;
    // Case-insensitive dedupe: server lowercases for matching, and the DB
    // UNIQUE (product_id, name) is case-sensitive, so "Hoodie" + "hoodie"
    // would otherwise both insert and then collide silently downstream.
    if (styles.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Style already added' });
      return;
    }
    setAdding(true);
    const { data, error } = await supabase
      .from('product_styles')
      .insert({
        product_id: productId,
        name,
        position: styles.length,
        price_delta: 0,
      })
      .select()
      .single();
    setAdding(false);
    if (error || !data) {
      toast({ title: 'Error', description: 'Failed to add style', variant: 'destructive' });
      return;
    }
    setStyles([...styles, { ...(data as unknown as ProductStyle), price_delta: 0 }]);
    setNewName('');
  };

  const patchStyle = async (id: string, patch: Partial<ProductStyle>) => {
    const prev = styles.find((s) => s.id === id);
    setStyles(styles.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { error } = await supabase
      .from('product_styles')
      .update(patch)
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to save style', variant: 'destructive' });
      refetch();
      return;
    }
    // Cascade rename to any variants tagged with the old style name so the
    // PDP variant matrix and existing carts stay aligned.
    if (patch.name && prev && patch.name !== prev.name && productId) {
      await supabase
        .from('product_variants')
        .update({ style: patch.name })
        .eq('product_id', productId)
        .eq('style', prev.name);
    }
  };

  const moveStyle = async (id: string, dir: -1 | 1) => {
    const idx = styles.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= styles.length) return;
    const next = [...styles];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const reindexed = next.map((s, i) => ({ ...s, position: i }));
    setStyles(reindexed);
    await Promise.all(
      reindexed.map((s) =>
        supabase.from('product_styles').update({ position: s.position }).eq('id', s.id),
      ),
    );
  };

  const deleteStyle = async (id: string) => {
    // Clear style off any variants that referenced it (free-text match).
    const target = styles.find((s) => s.id === id);
    if (target) {
      await supabase
        .from('product_variants')
        .update({ style: null })
        .eq('product_id', productId!)
        .eq('style', target.name);
    }
    const { error } = await supabase.from('product_styles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete style', variant: 'destructive' });
      return;
    }
    setStyles(styles.filter((s) => s.id !== id));
  };

  const triggerUpload = (id: string) => {
    setUploadTarget(id);
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadTarget) return;
    const targetId = uploadTarget;
    setUploadTarget(null);
    setUploadingId(targetId);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `styles/${productId}/${targetId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      await patchStyle(targetId, { icon_url: pub.publicUrl });
      toast({ title: 'Icon uploaded' });
    } catch {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <p className="text-xs text-muted-foreground">
        Offer the same design across different garment types. Leave empty if this product is a single piece.
      </p>

      {/* Add row */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStyle(); } }}
          placeholder="Hoodie, T-Shirt, Crewneck…"
          className="rounded-none"
          disabled={!productId || adding}
        />
        <Button
          type="button"
          onClick={addStyle}
          disabled={!productId || adding || !newName.trim()}
          className="rounded-none text-xs uppercase tracking-wider"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
        </Button>
      </div>

      {/* List */}
      {styles.length === 0 ? (
        <div className="border border-dashed border-border p-6 text-center text-xs text-muted-foreground uppercase tracking-wider">
          No styles yet
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {styles.map((s, i) => (
            <div key={s.id} className="grid grid-cols-[44px_1fr_1fr_110px_auto] items-center gap-3 px-3 py-2">
              {/* Icon */}
              <button
                type="button"
                onClick={() => triggerUpload(s.id)}
                className="relative w-11 h-11 border border-border bg-secondary/40 grid place-items-center hover:bg-secondary transition-colors"
                title="Upload icon"
              >
                {uploadingId === s.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : s.icon_url ? (
                  <img src={s.icon_url} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
                {s.icon_url && (
                  <span
                    role="button"
                    aria-label="Remove icon"
                    onClick={(e) => { e.stopPropagation(); patchStyle(s.id, { icon_url: null }); }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-background border border-border grid place-items-center"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>

              {/* Name */}
              <Input
                defaultValue={s.name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== s.name) patchStyle(s.id, { name: v });
                  else e.target.value = s.name;
                }}
                className="h-8 text-sm rounded-none"
              />

              {/* Label (optional short display) */}
              <Input
                defaultValue={s.label || ''}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if ((v || null) !== s.label) patchStyle(s.id, { label: v || null });
                }}
                placeholder="Display label (optional)"
                className="h-8 text-sm rounded-none"
              />

              {/* Price delta */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={s.price_delta}
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    if (v !== s.price_delta) patchStyle(s.id, { price_delta: v });
                  }}
                  className="h-8 text-sm rounded-none"
                />
              </div>

              {/* Reorder + delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveStyle(s.id, -1)}
                  disabled={i === 0}
                  className="h-8 w-8 grid place-items-center border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStyle(s.id, 1)}
                  disabled={i === styles.length - 1}
                  className="h-8 w-8 grid place-items-center border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteStyle(s.id)}
                  className="h-8 w-8 grid place-items-center border border-border hover:bg-destructive/10"
                  aria-label="Delete style"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleManager;
