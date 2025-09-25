import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Check, 
  X,
  Reply,
  Trash2,
  Filter,
  Star,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MessageManagerProps {
  messages: any[];
  toast: any;
}

const MessageManager = ({ messages, toast }: MessageManagerProps) => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [deletingMessage, setDeletingMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyText, setReplyText] = useState('');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  // Filtrar mensagens
  const filteredMessages = messages?.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = (() => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'unread') return !message.is_read;
      if (statusFilter === 'read') return message.is_read;
      if (statusFilter === 'replied') return message.is_replied;
      return true;
    })();
    
    return matchesSearch && matchesStatus;
  }) || [];

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mensagem marcada como lida",
      });

    } catch (error: any) {
      console.error('Erro ao marcar mensagem como lida:', error);
      toast({
        title: "Erro!",
        description: "Erro ao marcar mensagem como lida",
        variant: "destructive",
      });
    }
  };

  const markAsReplied = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_replied: true })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mensagem marcada como respondida",
      });

    } catch (error: any) {
      console.error('Erro ao marcar mensagem como respondida:', error);
      toast({
        title: "Erro!",
        description: "Erro ao marcar mensagem como respondida",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async () => {
    if (!deletingMessage) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', deletingMessage.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mensagem excluída com sucesso!",
      });

      setDeletingMessage(null);

    } catch (error: any) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro!",
        description: "Erro ao excluir mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const sendReply = async () => {
    if (!replyingTo || !replyText.trim()) return;

    try {
      console.log('Enviando resposta:', {
        messageId: replyingTo.id,
        replyText: replyText.trim()
      });

      // Tentar diferentes abordagens de atualização
      let updateData: any = {
        admin_notes: replyText.trim()
      };

      // Tentar adicionar campos opcionais se existirem
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .update(updateData)
          .eq('id', replyingTo.id)
          .select();

        if (error) {
          console.error('Erro na primeira tentativa:', error);
          throw error;
        }

        console.log('Resposta salva com sucesso (primeira tentativa):', data);
        
      } catch (firstError: any) {
        console.log('Primeira tentativa falhou, tentando abordagem alternativa...');
        
        // Tentar apenas com admin_notes
        const { data, error } = await supabase
          .from('contact_messages')
          .update({ 
            admin_notes: replyText.trim()
          })
          .eq('id', replyingTo.id)
          .select();

        if (error) {
          console.error('Erro na segunda tentativa:', error);
          throw error;
        }

        console.log('Resposta salva com sucesso (segunda tentativa):', data);
      }

      // Tentar atualizar status e replied_at separadamente
      try {
        await supabase
          .from('contact_messages')
          .update({ 
            status: 'replied',
            replied_at: new Date().toISOString()
          })
          .eq('id', replyingTo.id);
      } catch (statusError) {
        console.log('Erro ao atualizar status, mas admin_notes foi salvo:', statusError);
      }
      
      toast({
        title: "Sucesso!",
        description: "Resposta enviada e salva com sucesso!",
      });

      setReplyingTo(null);
      setReplyText('');

    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      toast({
        title: "Erro!",
        description: `Erro ao enviar resposta: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Estatísticas
  const stats = {
    total: messages?.length || 0,
    unread: messages?.filter(m => !m.is_read).length || 0,
    read: messages?.filter(m => m.is_read).length || 0,
    replied: messages?.filter(m => m.is_replied).length || 0,
    today: messages?.filter(message => {
      const today = new Date().toDateString();
      const messageDate = new Date(message.created_at).toDateString();
      return today === messageDate;
    }).length || 0
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Central de Mensagens</h2>
          <p className="text-gray-400 mt-2">Gerencie mensagens de clientes e suporte</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
            {filteredMessages.length} Mensagens
          </Badge>
          {stats.unread > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
              {stats.unread} Não lidas
            </Badge>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.unread}</p>
            <p className="text-xs text-gray-400">Não lidas</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.read}</p>
            <p className="text-xs text-gray-400">Lidas</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.replied}</p>
            <p className="text-xs text-gray-400">Respondidas</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-brand-green">{stats.today}</p>
            <p className="text-xs text-gray-400">Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, email, assunto ou mensagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-600 bg-brand-dark-lighter text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-600 bg-brand-dark-lighter text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                  <SelectItem value="replied">Respondidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mensagens */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma mensagem encontrada</h3>
              <p className="text-gray-400">Ajuste os filtros ou aguarde novas mensagens.</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${
              !message.is_read ? 'ring-2 ring-blue-500/30' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {message.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>

                  {/* Conteúdo da Mensagem */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{message.name || 'Nome não informado'}</h3>
                        <p className="text-sm text-gray-400">{message.email || 'Email não informado'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {message.priority && (
                          <Badge className={getPriorityColor(message.priority)}>
                            {getPriorityLabel(message.priority)}
                          </Badge>
                        )}
                        {!message.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-400">{getRelativeTime(message.created_at)}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-white font-medium mb-1">{message.subject || 'Sem assunto'}</h4>
                      <p className="text-gray-300 text-sm line-clamp-2">{message.message}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(message.created_at)}
                      </p>
                      {message.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {message.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMessage(message)}
                      className="border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {!message.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Lida
                      </Button>
                    )}
                    
                    {!message.is_replied && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(message)}
                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Responder
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingMessage(message)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagem de {selectedMessage.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Detalhes completos da mensagem
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações do Remetente */}
              <Card className="bg-brand-dark-lighter border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Informações do Remetente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedMessage.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedMessage.name || 'Nome não informado'}</p>
                      <p className="text-sm text-gray-400">{selectedMessage.email || 'Email não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedMessage.email || 'Não informado'}</p>
                    </div>
                    {selectedMessage.phone && (
                      <div>
                        <p className="text-sm text-gray-400">Telefone</p>
                        <p className="text-white">{selectedMessage.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Conteúdo da Mensagem */}
              <Card className="bg-brand-dark-lighter border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Conteúdo da Mensagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Assunto</p>
                    <p className="text-white font-medium">{selectedMessage.subject || 'Sem assunto'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Mensagem</p>
                    <div className="mt-2 p-4 bg-brand-dark-light rounded-lg">
                      <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Data de Envio</p>
                      <p className="text-white">{formatDate(selectedMessage.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <div className="flex items-center gap-2">
                        {selectedMessage.is_read ? (
                          <Badge className="bg-green-500/20 text-green-400">Lida</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400">Não lida</Badge>
                        )}
                        {selectedMessage.is_replied && (
                          <Badge className="bg-blue-500/20 text-blue-400">Respondida</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resposta da Equipe (se houver) */}
              {selectedMessage.admin_notes && selectedMessage.admin_notes.trim() !== '' && (
                <Card className="bg-green-900/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                      <Reply className="h-5 w-5" />
                      Resposta da Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 bg-green-800/20 rounded-lg border border-green-500/30">
                      <p className="text-white whitespace-pre-wrap">{selectedMessage.admin_notes}</p>
                    </div>
                    {selectedMessage.replied_at && (
                      <p className="text-sm text-green-400">
                        Respondido em: {formatDate(selectedMessage.replied_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="flex gap-3">
                {!selectedMessage.is_read && (
                  <Button
                    onClick={() => markAsRead(selectedMessage.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como Lida
                  </Button>
                )}
                
                {!selectedMessage.is_replied && (
                  <Button
                    onClick={() => setReplyingTo(selectedMessage)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Resposta */}
      {replyingTo && (
        <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
          <DialogContent className="bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Responder Mensagem</DialogTitle>
              <DialogDescription className="text-gray-400">
                Respondendo para {replyingTo.name} ({replyingTo.email})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-400">Sua Resposta</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="mt-2 min-h-[120px] border-gray-600 bg-brand-dark-lighter text-white"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={sendReply}
                  className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white"
                  disabled={!replyText.trim()}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Exclusão */}
      {deletingMessage && (
        <Dialog open={!!deletingMessage} onOpenChange={() => setDeletingMessage(null)}>
          <DialogContent className="bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tem certeza que deseja excluir esta mensagem?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingMessage(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={deleteMessage}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MessageManager;
