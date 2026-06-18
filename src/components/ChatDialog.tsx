import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  form_id: string | null;
  read: boolean;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  peerUserId: string;
  peerName: string;
  formId?: string;
  formNumber?: string;
}

export function ChatDialog({ open, onOpenChange, peerUserId, peerName, formId, formNumber }: ChatDialogProps) {
  const { authUser, role } = useAuth();
  const isAdmin = role === "admin";
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!authUser || !peerUserId) return;
    let query = supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${authUser.id},recipient_id.eq.${peerUserId}),and(sender_id.eq.${peerUserId},recipient_id.eq.${authUser.id})`)
      .order("created_at", { ascending: true });
    if (formId) query = query.eq("form_id", formId);
    const { data } = await query;
    setMessages((data as Message[]) || []);

    // mark received as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("recipient_id", authUser.id)
      .eq("sender_id", peerUserId)
      .eq("read", false);
  };

  useEffect(() => {
    if (!open) return;
    load();
    const ch = supabase
      .channel(`chat-${authUser?.id}-${peerUserId}-${formId || "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [open, peerUserId, formId, authUser?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !authUser) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: authUser.id,
      recipient_id: peerUserId,
      content: text.trim(),
      form_id: formId || null,
    });
    setSending(false);
    if (error) { toast.error("Gagal mengirim pesan"); return; }
    setText("");
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) { toast.error("Gagal menghapus pesan"); return; }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success("Pesan dihapus");
  };

  const deleteAll = async () => {
    if (!authUser || !peerUserId) return;
    const { error } = await supabase
      .from("messages")
      .delete()
      .or(`and(sender_id.eq.${authUser.id},recipient_id.eq.${peerUserId}),and(sender_id.eq.${peerUserId},recipient_id.eq.${authUser.id})`);
    if (error) { toast.error("Gagal menghapus percakapan"); return; }
    setMessages([]);
    toast.success("Percakapan dihapus");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle>
              Chat dengan {peerName}
              {formNumber && <span className="text-xs text-muted-foreground ml-2">({formNumber})</span>}
            </DialogTitle>
            {isAdmin && messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus semua percakapan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Seluruh pesan dengan {peerName} akan dihapus permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>
        <div ref={scrollRef} className="h-80 overflow-y-auto bg-muted/30 rounded-lg p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Belum ada pesan</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === authUser?.id;
            const canDelete = isAdmin || mine;
            return (
              <div key={m.id} className={`group flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                {mine && canDelete && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1"
                    aria-label="Hapus pesan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </p>
                </div>
                {!mine && canDelete && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1"
                    aria-label="Hapus pesan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan..."
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <Button onClick={send} disabled={sending || !text.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
