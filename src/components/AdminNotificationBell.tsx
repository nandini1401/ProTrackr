import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface MsgRow {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export function AdminNotificationBell() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [senderNames, setSenderNames] = useState<Map<string, string>>(new Map());
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!authUser) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data as MsgRow[]) || [];
    setMessages(rows);
    const ids = Array.from(new Set(rows.map(r => r.sender_id)));
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id,full_name,email").in("user_id", ids);
      const map = new Map<string, string>();
      (profs || []).forEach((p: any) => map.set(p.user_id, p.full_name || p.email || "User"));
      setSenderNames(map);
    }
  };

  useEffect(() => {
    if (!authUser) return;
    load();
    const ch = supabase
      .channel(`admin-notifs-${authUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${authUser.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [authUser?.id]);

  const unread = messages.filter(m => !m.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <p className="font-semibold text-sm">Pesan Masuk</p>
          <button onClick={() => { setOpen(false); navigate("/messages"); }} className="text-xs text-primary hover:underline">
            Lihat semua
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada pesan</p>
          ) : messages.map(m => (
            <button
              key={m.id}
              onClick={() => { setOpen(false); navigate("/messages"); }}
              className={`w-full text-left p-3 border-b hover:bg-muted/50 ${!m.read ? "bg-primary/5" : ""}`}
            >
              <p className="text-xs font-medium text-foreground">{senderNames.get(m.sender_id) || "User"}</p>
              <p className="text-sm text-foreground line-clamp-2">{m.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString("id-ID")}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
