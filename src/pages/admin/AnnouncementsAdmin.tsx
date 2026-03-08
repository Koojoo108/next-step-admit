import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AnnouncementsAdmin = () => {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setTitle(''); setContent(''); setDialogOpen(true); };
  const openEdit = (a: any) => { setEditItem(a); setTitle(a.title); setContent(a.content || ''); setDialogOpen(true); };

  const save = async () => {
    if (!title.trim()) return;
    if (editItem) {
      await supabase.from('announcements').update({ title, content }).eq('id', editItem.id);
      toast({ title: 'Announcement updated' });
    } else {
      await supabase.from('announcements').insert({ title, content });
      toast({ title: 'Announcement created' });
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    toast({ title: 'Announcement deleted' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Announcements</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New Announcement</Button>
      </div>

      <div className="space-y-4">
        {items.map(a => (
          <div key={a.id} className="bg-card rounded-lg p-6 border border-border shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No announcements yet.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'New'} Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
            <Button onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsAdmin;
