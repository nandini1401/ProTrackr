import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSharedData } from "@/contexts/SharedDataContext";
import { ChatDialog } from "@/components/ChatDialog";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MsgRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  peerId: string;
  peerName: string;
  peerAvatar: string;
  peerJobTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isFromPeer: boolean;
}

const MessagesPage = () => {
  const { authUser } = useAuth();
  const { people } = useSharedData();
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { name: string; email: string }>>(new Map());
  const [search, setSearch] = useState("");
  const [chatPeer, setChatPeer] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    if (!authUser) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)
      .order("created_at", { ascending: false });
    const rows = (data as MsgRow[]) || [];
    setMessages(rows);

    // fetch profiles for all peers
    const peerIds = Array.from(new Set(rows.map(m => m.sender_id === authUser.id ? m.recipient_id : m.sender_id)));
    if (peerIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id,full_name,email").in("user_id", peerIds);
      const map = new Map<string, { name: string; email: string }>();
      (profs || []).forEach((p: any) => map.set(p.user_id, { name: p.full_name || p.email || "User", email: p.email || "" }));
      setProfiles(map);
    }
  };

  useEffect(() => {
    if (!authUser) return;
    load();
    const ch = supabase
      .channel(`admin-msgs-${authUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [authUser?.id]);

  // Build conversations grouped by peer
  const conversations: Conversation[] = (() => {
    if (!authUser) return [];
    const map = new Map<string, Conversation>();
    for (const m of messages) {
      const peerId = m.sender_id === authUser.id ? m.recipient_id : m.sender_id;
      const isFromPeer = m.sender_id !== authUser.id;
      const profile = profiles.get(peerId);
      const personMatch = profile ? people.find(p => p.email.toLowerCase() === profile.email.toLowerCase()) : undefined;
      const existing = map.get(peerId);
      if (!existing) {
        map.set(peerId, {
          peerId,
          peerName: personMatch?.name || profile?.name || "User",
          peerAvatar: personMatch?.avatar || "",
          peerJobTitle: personMatch?.jobTitle || "",
          lastMessage: m.content,
          lastTime: m.created_at,
          unread: isFromPeer && !m.read ? 1 : 0,
          isFromPeer,
        });
      } else {
        if (isFromPeer && !m.read) existing.unread += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
  })();

  const filtered = conversations.filter(c => c.peerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Pesan">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari pekerja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-lg border divide-y">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Belum ada percakapan</p>
            </div>
          ) : filtered.map(c => (
            <button
              key={c.peerId}
              onClick={() => setChatPeer({ id: c.peerId, name: c.peerName })}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition text-left"
            >
              <Avatar className="h-11 w-11">
                <AvatarImage src={c.peerAvatar} />
                <AvatarFallback>{c.peerName.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">{c.peerName}</p>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(c.lastTime).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </span>
                </div>
                {c.peerJobTitle && <p className="text-xs text-muted-foreground">{c.peerJobTitle}</p>}
                <p className={`text-sm truncate ${c.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {c.isFromPeer ? "" : "Anda: "}{c.lastMessage}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {chatPeer && (
          <ChatDialog
            open={!!chatPeer}
            onOpenChange={(o) => !o && setChatPeer(null)}
            peerUserId={chatPeer.id}
            peerName={chatPeer.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
