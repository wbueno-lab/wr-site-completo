import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Reply, 
  Archive, 
  Star, 
  Trash2,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  is_priority: boolean;
  admin_notes?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

const ContactMessagesManager = () => {
  const { contactMessages, isLoading } = useRealtime();
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Filtrar mensagens
  useEffect(() => {
    let filtered = contactMessages;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    // Filtro por prioridade
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(msg => 
        priorityFilter === 'priority' ? msg.is_priority : !msg.is_priority
      );
    }

    setFilteredMessages(filtered);
  }, [contactMessages, searchTerm, statusFilter, priorityFilter]);

  // Marcar mensagem como lida
  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Mensagem marcada como lida",
        description: "Status atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Marcar como respondida
  const markAsReplied = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'replied',
          replied_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Mensagem marcada como respondida",
        description: "Status atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao marcar como respondida:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Arquivar mensagem
  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'archived' })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Mensagem arquivada",
        description: "Mensagem movida para arquivo.",
      });
    } catch (error: any) {
      console.error('Erro ao arquivar:', error);
      toast({
        title: "Erro ao arquivar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Deletar mensagem
  const deleteMessage = async (messageId: string) => {
    try {
      setIsDeleting(messageId);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Mensagem deletada",
        description: "Mensagem removida permanentemente.",
      });
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro ao deletar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Alternar prioridade
  const togglePriority = async (messageId: string, currentPriority: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_priority: !currentPriority })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Prioridade atualizada",
        description: currentPriority ? "Mensagem removida da prioridade." : "Mensagem marcada como prioritária.",
      });
    } catch (error: any) {
      console.error('Erro ao alterar prioridade:', error);
      toast({
        title: "Erro ao atualizar prioridade",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Salvar notas do admin
  const saveAdminNotes = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes: adminNotes })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Notas salvas",
        description: "Notas do administrador atualizadas.",
      });

      setAdminNotes('');
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar notas:', error);
      toast({
        title: "Erro ao salvar notas",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Abrir detalhes da mensagem
  const openMessageDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setAdminNotes(message.admin_notes || '');
    setIsDialogOpen(true);
    
    // Marcar como lida se ainda não foi
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  // Estatísticas
  const stats = {
    total: contactMessages.length,
    new: contactMessages.filter(m => m.status === 'new').length,
    read: contactMessages.filter(m => m.status === 'read').length,
    replied: contactMessages.filter(m => m.status === 'replied').length,
    priority: contactMessages.filter(m => m.is_priority).length
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      read: 'secondary',
      replied: 'outline',
      archived: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status === 'new' ? 'Nova' : 
         status === 'read' ? 'Lida' :
         status === 'replied' ? 'Respondida' : 'Arquivada'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando mensagens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Novas</p>
                <p className="text-2xl font-bold text-green-600">{stats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Lidas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Respondidas</p>
                <p className="text-2xl font-bold text-purple-600">{stats.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Prioritárias</p>
                <p className="text-2xl font-bold text-orange-600">{stats.priority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email, assunto ou mensagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="new">Novas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
                <SelectItem value="replied">Respondidas</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="priority">Prioritárias</SelectItem>
                <SelectItem value="normal">Normais</SelectItem>
              </SelectContent>
            </Select>
            
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma mensagem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`${message.is_priority ? 'border-orange-500 bg-orange-50/10' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{message.name}</h3>
                      {message.is_priority && (
                        <Star className="h-4 w-4 text-orange-500 fill-current" />
                      )}
                      {getStatusBadge(message.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{message.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{message.subject}</p>
                      <p className="text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMessageDetails(message)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {message.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(message.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Marcar como lida
                      </Button>
                    )}
                    
                    {message.status === 'read' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReplied(message.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Marcar como respondida
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePriority(message.id, message.is_priority)}
                    >
                      <Star className={`h-4 w-4 mr-1 ${message.is_priority ? 'fill-current text-orange-500' : ''}`} />
                      {message.is_priority ? 'Remover prioridade' : 'Priorizar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveMessage(message.id)}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Arquivar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deletar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMessage(message.id)}
                            disabled={isDeleting === message.id}
                          >
                            {isDeleting === message.id ? 'Deletando...' : 'Deletar'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalhes da mensagem */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="contact-message-detail-description">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
            <DialogDescription id="contact-message-detail-description">
              Visualize e gerencie os detalhes da mensagem de contato
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Informações do remetente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações do Remetente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <p className="text-sm text-gray-600">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label>Data de Envio</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>
              </div>
              
              {/* Assunto e mensagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conteúdo da Mensagem</h3>
                <div>
                  <Label>Assunto</Label>
                  <p className="text-sm text-gray-600 font-medium">{selectedMessage.subject}</p>
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
              
              {/* Notas do administrador */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notas do Administrador</h3>
                <div>
                  <Label htmlFor="admin-notes">Adicionar ou editar notas</Label>
                  <Textarea
                    id="admin-notes"
                    name="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione suas notas sobre esta mensagem..."
                    autoComplete="off"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => saveAdminNotes(selectedMessage.id)}>
                    Salvar Notas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessagesManager;
