import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ProgrammesAdmin = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('programmes').select('*').order('name');
    setProgrammes(data || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setName(''); setDescription(''); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditItem(p); setName(p.name); setDescription(p.description || ''); setDialogOpen(true); };

  const save = async () => {
    if (!name.trim()) return;
    if (editItem) {
      await supabase.from('programmes').update({ name, description }).eq('id', editItem.id);
      toast({ title: 'Programme updated' });
    } else {
      await supabase.from('programmes').insert({ name, description });
      toast({ title: 'Programme added' });
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('programmes').delete().eq('id', id);
    toast({ title: 'Programme deleted' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Programme Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Programme</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programmes.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.description || '—'}</td>
                <td className="px-4 py-3 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Programme</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
            <Button onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgrammesAdmin;
