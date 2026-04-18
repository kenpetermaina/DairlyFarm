import { useFarmStore, Message, DailyUpdate, Notification } from "@/store/farmStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Bell, Send, Plus, Trash2, Check, AlertCircle, Activity, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function CommunicationPage() {
  const { messages, addMessage, markMessageRead, deleteMessage, workers, dailyUpdates, addDailyUpdate, deleteDailyUpdate, notifications, addNotification, markNotificationRead, deleteNotification } = useFarmStore();
  
  // Messages tab state
  const [messageDialog, setMessageDialog] = useState(false);
  const [messageForm, setMessageForm] = useState({ recipient_id: "", recipient_name: "", content: "" });
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Daily Updates tab state
  const [updateDialog, setUpdateDialog] = useState(false);
  const [updateForm, setUpdateForm] = useState({ title: "", description: "" });

  // Notifications tab state
  const [notifDialog, setNotifDialog] = useState(false);
  const [notifForm, setNotifForm] = useState({ type: "general" as const, title: "", message: "" });

  const handleSendMessage = () => {
    if (!messageForm.recipient_id || !messageForm.content) {
      return toast.error("Fill all fields");
    }
    addMessage({
      sender_id: "farmer_001",
      sender_name: "Farm Manager",
      sender_type: "farmer",
      recipient_id: messageForm.recipient_id,
      recipient_name: messageForm.recipient_name,
      content: messageForm.content,
      read: false,
    });
    toast.success("Message sent");
    setMessageForm({ recipient_id: "", recipient_name: "", content: "" });
    setMessageDialog(false);
  };

  const handleAddUpdate = () => {
    if (!updateForm.title || !updateForm.description) {
      return toast.error("Fill all fields");
    }
    addDailyUpdate({
      worker_id: "worker_001",
      worker_name: "Farm Worker",
      title: updateForm.title,
      description: updateForm.description,
    });
    toast.success("Update posted");
    setUpdateForm({ title: "", description: "" });
    setUpdateDialog(false);
  };

  const handleAddNotification = () => {
    if (!notifForm.title || !notifForm.message) {
      return toast.error("Fill all fields");
    }
    addNotification({
      type: notifForm.type,
      title: notifForm.title,
      message: notifForm.message,
      read: false,
    });
    toast.success("Notification created");
    setNotifForm({ type: "general", title: "", message: "" });
    setNotifDialog(false);
  };

  const getConversation = (partnerId: string) => messages.filter((m) => m.recipient_id === partnerId || m.sender_id === partnerId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const notificationIcon = (type: string) => {
    switch (type) {
      case "milk_collection":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "health_alert":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "feeding_schedule":
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const unreadMessages = messages.filter((m) => !m.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader title="Communication" subtitle="Farm team messaging, updates, and notifications" />
      
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="relative">
            Messages {unreadMessages > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadMessages}</span>}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications {unreadNotifications > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifications}</span>}
          </TabsTrigger>
          <TabsTrigger value="updates">Daily Updates</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> New Message</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Send Message</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Worker</label>
                    <select value={messageForm.recipient_id} onChange={(e) => {
                      const worker = workers.find((w) => w.id === e.target.value);
                      setMessageForm({ ...messageForm, recipient_id: e.target.value, recipient_name: worker?.name || "" });
                    }} className="w-full mt-2 px-3 py-2 border border-border rounded-md">
                      <option value="">-- Select Worker --</option>
                      {workers.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea value={messageForm.content} onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })} placeholder="Type your message..." className="w-full mt-2 px-3 py-2 border border-border rounded-md h-20" />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full">Send Message</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Conversations List */}
            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-2">Conversations</p>
              {workers.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-4">No workers added yet</p>
              ) : (
                workers.map((w) => {
                  const unread = messages.filter((m) => (m.recipient_id === w.id || m.sender_id === w.id) && !m.read).length;
                  return (
                    <button key={w.id} onClick={() => setSelectedConversation(w.id)} className={`w-full text-left p-3 rounded-lg border transition ${selectedConversation === w.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{w.name}</span>
                        {unread > 0 && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">{unread}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{w.role}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Chat View */}
            <div className="col-span-2">
              {selectedConversation ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{workers.find((w) => w.id === selectedConversation)?.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-96 overflow-y-auto space-y-3 p-3 bg-muted rounded-lg">
                      {getConversation(selectedConversation).length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>
                      ) : (
                        getConversation(selectedConversation).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender_type === "farmer" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${msg.sender_type === "farmer" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Type a reply..." />
                      <Button size="icon"><Send className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-96 flex items-center justify-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">Select a conversation to view messages</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={notifDialog} onOpenChange={setNotifDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> New Alert</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Notification</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select value={notifForm.type} onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value as any })} className="w-full mt-2 px-3 py-2 border border-border rounded-md">
                      <option value="milk_collection">Milk Collection</option>
                      <option value="health_alert">Health Alert</option>
                      <option value="feeding_schedule">Feeding Schedule</option>
                      <option value="breeding">Breeding</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <Input placeholder="Title" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} />
                  <textarea value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} placeholder="Message content..." className="w-full px-3 py-2 border border-border rounded-md h-20" />
                  <Button onClick={handleAddNotification} className="w-full">Create Notification</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">No notifications yet</p>
            ) : (
              notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((notif) => (
                <Card key={notif.id} className={notif.read ? "opacity-75" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {notificationIcon(notif.type)}
                        <CardTitle className="text-base">{notif.title}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        {!notif.read && <Button variant="ghost" size="icon" onClick={() => markNotificationRead(notif.id)}><Check className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(notif.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notif.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Daily Updates Tab */}
        <TabsContent value="updates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> Post Update</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post Daily Update</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Title" value={updateForm.title} onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })} />
                  <textarea value={updateForm.description} onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })} placeholder="What happened on the farm today?" className="w-full px-3 py-2 border border-border rounded-md h-32" />
                  <Button onClick={handleAddUpdate} className="w-full">Post Update</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {dailyUpdates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No updates yet</p>
            ) : (
              dailyUpdates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((update) => (
                <Card key={update.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{update.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{update.worker_name} • {new Date(update.created_at).toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteDailyUpdate(update.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{update.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* WhatsApp Integration Button */}
      <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">WhatsApp Integration</h3>
                <p className="text-sm text-green-700">Send quick alerts to your team via WhatsApp</p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">Send WhatsApp Alert</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
