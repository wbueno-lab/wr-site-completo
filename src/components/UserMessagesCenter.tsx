import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle,
  Clock,
  Trash2,
  AlertTriangle
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
  admin_notes?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
}

const UserMessagesCenter = () => {
  const { user } = useAuth();
  const { contactMessages, isLoading } = useRealtime();
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-messages');
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Filtrar mensagens do usuário logado
  const userMessages = useMemo(() => {
    if (!user) return [];
    const userEmail = user.email?.toLowerCase();
    return contactMessages.filter(msg => msg.email.toLowerCase() === userEmail);
  }, [contactMessages, user?.email]);

  // Verificar se há mensagens com respostas
  const hasMessagesWithResponse = userMessages.some(msg => msg.admin_notes && msg.admin_notes.trim() !== '');
  
  // Debug: verificar dados das mensagens apenas quando as mensagens mudarem
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug UserMessagesCenter:', {
        totalContactMessages: contactMessages.length,
        userMessages: userMessages.length,
        userEmail: user?.email,
        messagesWithAdminNotes: userMessages.filter(m => m.admin_notes && m.admin_notes.trim() !== '').length,
        sampleMessage: userMessages[0],
        allMessages: userMessages.map(m => ({
          id: m.id,
          subject: m.subject,
          admin_notes: m.admin_notes,
          replied_at: m.replied_at,
          status: m.status
        }))
      });
    }
  }, [contactMessages, user?.email]);


  // Filtrar mensagens
  useEffect(() => {
    const filterMessages = () => {
      let filtered = userMessages;

      // Filtro por termo de busca
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter(msg => 
          msg.subject.toLowerCase().includes(searchTermLower) ||
          msg.message.toLowerCase().includes(searchTermLower)
        );
      }

      // Filtro por status
      if (statusFilter !== 'all') {
        if (statusFilter === 'with_response') {
          filtered = filtered.filter(msg => msg.admin_notes && msg.admin_notes.trim() !== '');
        } else {
          filtered = filtered.filter(msg => msg.status === statusFilter);
        }
      }

      return filtered;
    };

    setFilteredMessages(filterMessages());
  }, [userMessages, searchTerm, statusFilter]);

  // Abrir detalhes da mensagem
  const openMessageDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };

  // Excluir mensagem
  const handleDeleteMessage = async (message: ContactMessage) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', message.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Mensagem excluída!",
        description: "Sua mensagem foi excluída com sucesso.",
      });

      setMessageToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro ao excluir mensagem",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Estatísticas do usuário
  const userStats = {
    total: userMessages.length,
    new: userMessages.filter(m => m.status === 'new').length,
    read: userMessages.filter(m => m.status === 'read').length,
    replied: userMessages.filter(m => m.status === 'replied').length,
    withResponse: userMessages.filter(m => m.admin_notes && m.admin_notes.trim() !== '').length
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      read: 'secondary',
      replied: 'outline',
      archived: 'destructive'
    } as const;

    const labels = {
      new: 'Nova',
      read: 'Lida',
      replied: 'Respondida',
      archived: 'Arquivada'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
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

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Faça login para visualizar suas mensagens</p>
        </CardContent>
      </Card>
    );
  }


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
                <p className="text-2xl font-bold">{userStats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{userStats.new}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{userStats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Respondidas</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Com Resposta</p>
                <p className="text-2xl font-bold text-green-600">{userStats.withResponse}</p>
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
                  placeholder="Buscar por assunto ou mensagem..."
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
                <SelectItem value="with_response">Com Resposta</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
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
              <p className="text-gray-500">
                {userMessages.length === 0 
                  ? "Você ainda não enviou nenhuma mensagem"
                  : "Nenhuma mensagem encontrada com os filtros aplicados"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`hover:shadow-md transition-shadow ${
                message.admin_notes ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{message.subject}</h3>
                      {getStatusBadge(message.status)}
                      {message.admin_notes && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Respondida
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      {message.replied_at && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span>Respondida em: {formatDate(message.replied_at)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                      {message.admin_notes && (
                        <div className="mt-2 p-2 bg-green-100 rounded-md border border-green-200">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-green-700 font-medium mb-1">Resposta da Equipe:</p>
                              <p className="text-sm text-green-800 line-clamp-2">{message.admin_notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
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
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setMessageToDelete(message)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>Confirmar Exclusão</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
                            <br />
                            <br />
                            <strong>Assunto:</strong> {message.subject}
                            <br />
                            <strong>Data:</strong> {formatDate(message.created_at)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMessage(message)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Excluindo...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </>
                            )}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="user-message-detail-description">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
            <DialogDescription id="user-message-detail-description">
              Visualize os detalhes da sua mensagem de contato
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">

              {/* Informações da mensagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações da Mensagem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Assunto</Label>
                    <p className="text-sm text-gray-600 font-medium">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedMessage.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Data de Envio</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  {selectedMessage.replied_at && (
                    <div>
                      <Label>Data da Resposta</Label>
                      <p className="text-sm text-gray-600">{formatDate(selectedMessage.replied_at)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Conteúdo da mensagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sua Mensagem</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              {/* Resposta do administrador (se houver) */}
              {selectedMessage.admin_notes && selectedMessage.admin_notes.trim() !== '' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-700">Resposta da Equipe</h3>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{selectedMessage.admin_notes}</p>
                        {selectedMessage.replied_at && (
                          <p className="text-xs text-green-600 mt-2">
                            Respondido em {formatDate(selectedMessage.replied_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Status da mensagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="flex items-center space-x-2">
                  {selectedMessage.status === 'new' && (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Sua mensagem foi recebida e será analisada em breve.</span>
                    </>
                  )}
                  {selectedMessage.status === 'read' && (
                    <>
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Sua mensagem foi lida pela equipe.</span>
                    </>
                  )}
                  {selectedMessage.status === 'replied' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Sua mensagem foi respondida pela equipe.</span>
                    </>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <>
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Esta conversa foi arquivada.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserMessagesCenter;
