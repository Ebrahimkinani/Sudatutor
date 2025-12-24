import { chatService } from "@/app/api/admin/chats/chat.service";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ChatDetailsPage({
    params,
}: {
    params: { sessionId: string };
}) {
    const data = await chatService.getSessionDetails(params.sessionId);
    if (!data) return notFound();

    const { session, messages } = data;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Chat Detail</h2>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <span>{session.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Messages ({messages.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-lg p-3 max-w-[80%] text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {msg.role} • {new Date(msg.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Info</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 mb-4">
                                <AvatarImage src={session.user.image || undefined} />
                                <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{session.user.name}</h3>
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Class</span>
                                <span className="font-medium">{session.class?.name || '-'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subject</span>
                                <span className="font-medium">{session.subject?.name || '-'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Started</span>
                                <span className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Last Msg</span>
                                <span className="font-medium">{new Date(session.lastMessageAt).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
