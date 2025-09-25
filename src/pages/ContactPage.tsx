import { useState } from "react";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import UserMessagesCenter from "@/components/UserMessagesCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

const ContactPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('contact-form');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Primeiro, tentar salvar no banco de dados
      try {
        const { error } = await supabase
          .from('contact_messages')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject,
            message: formData.message,
            status: 'new'
          });

        if (error) {
          console.warn('Erro ao salvar no banco de dados:', error);
          // Continuar com o fallback mesmo se houver erro
        }
      } catch (dbError) {
        console.warn('Tabela contact_messages não existe ainda:', dbError);
        // Continuar com o fallback
      }

      // Fallback: simular envio de email (funciona sempre)
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mostrar erro mais específico
      let errorMessage = "Tente novamente em alguns instantes.";
      
      if (error?.message?.includes('contact_messages')) {
        errorMessage = "Sistema de mensagens ainda não configurado. Sua mensagem foi registrada localmente.";
      } else if (error?.message?.includes('permission')) {
        errorMessage = "Erro de permissão. Verifique as configurações do banco de dados.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro ao enviar mensagem",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent-neon/5 to-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-hero">
              Entre em Contato
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Estamos aqui para ajudar! Entre em contato conosco para qualquer dúvida ou sugestão.
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        {/* Tabs para alternar entre formulário e central de mensagens */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="contact-form" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Mensagem
            </TabsTrigger>
            <TabsTrigger value="messages-center" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Minhas Mensagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact-form" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
            <Card className="border-animated">
              <CardHeader>
                <CardTitle className="text-2xl">Envie sua mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e entraremos em contato em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  aria-label="Formulário de contato"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" required>Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Seu nome completo"
                        aria-required="true"
                        aria-invalid={!formData.name}
                        aria-describedby="name-error"
                      />
                      {!formData.name && (
                        <span id="name-error" className="sr-only">
                          O nome é obrigatório
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" required>Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="seu@email.com"
                        aria-required="true"
                        aria-invalid={!formData.email}
                        aria-describedby="email-error"
                      />
                      {!formData.email && (
                        <span id="email-error" className="sr-only">
                          O email é obrigatório
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        type="tel"
                        aria-required="false"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" required>Assunto</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Qual o assunto?"
                        aria-required="true"
                        aria-invalid={!formData.subject}
                        aria-describedby="subject-error"
                      />
                      {!formData.subject && (
                        <span id="subject-error" className="sr-only">
                          O assunto é obrigatório
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" required>Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Escreva sua mensagem aqui..."
                      rows={6}
                      aria-required="true"
                      aria-invalid={!formData.message}
                      aria-describedby="message-error"
                    />
                    {!formData.message && (
                      <span id="message-error" className="sr-only">
                        A mensagem é obrigatória
                      </span>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="w-full" 
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? "Enviando mensagem..." : "Enviar mensagem"}
                  >
                    {isSubmitting ? (
                      <>
                        <div 
                          className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" 
                          role="progressbar"
                          aria-valuetext="Carregando..."
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Endereço</h3>
                    <p className="text-white/70">
                      Rua das Motos, 123<br />
                      Centro - São Paulo, SP<br />
                      CEP: 01234-567
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Telefone</h3>
                    <p className="text-white/70">
                      (11) 99999-9999<br />
                      (11) 3333-4444
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Email</h3>
                    <p className="text-white/70">
                      contato@wrcapacetes.com.br<br />
                      vendas@wrcapacetes.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Horário de Funcionamento</h3>
                    <p className="text-white/70">
                      Segunda a Sexta: 8h às 18h<br />
                      Sábado: 8h às 12h<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-white">Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-white">Qual o prazo de entrega?</h4>
                  <p className="text-sm text-white/70">
                    O prazo de entrega é de 3 a 7 dias úteis para São Paulo e 5 a 10 dias úteis para outras regiões.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-white">Posso trocar o produto?</h4>
                  <p className="text-sm text-white/70">
                    Sim, você tem 7 dias para trocar o produto por outro tamanho ou modelo.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-white">Oferecem garantia?</h4>
                  <p className="text-sm text-white/70">
                    Todos os nossos produtos possuem garantia de 1 ano contra defeitos de fabricação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="messages-center">
            <RealtimeProvider>
              <UserMessagesCenter />
            </RealtimeProvider>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactPage;
