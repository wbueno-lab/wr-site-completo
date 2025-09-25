import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  TrendingUp,
  Settings,
  Download,
  Upload,
  BarChart3,
  Bell,
  Users
} from 'lucide-react';

interface QuickActionsProps {
  totalProducts: number;
  totalOrders: number;
  pendingMessages: number;
  onNavigate: (tab: string) => void;
}

const QuickActions = ({ totalProducts, totalOrders, pendingMessages, onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      icon: Plus,
      title: 'Novo Produto',
      description: 'Adicionar produto ao catálogo',
      color: 'from-brand-green to-brand-green-dark',
      iconColor: 'text-white',
      onClick: () => onNavigate('products')
    },
    {
      icon: ShoppingBag,
      title: 'Gerenciar Pedidos',
      description: `${totalOrders} pedidos totais`,
      color: 'from-blue-500 to-blue-600',
      iconColor: 'text-white',
      onClick: () => onNavigate('orders')
    },
    {
      icon: MessageSquare,
      title: 'Central de Mensagens',
      description: `${pendingMessages} não lidas`,
      color: 'from-yellow-500 to-yellow-600',
      iconColor: 'text-white',
      onClick: () => onNavigate('messages'),
      badge: pendingMessages > 0 ? pendingMessages : undefined
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Análises detalhadas',
      color: 'from-purple-500 to-purple-600',
      iconColor: 'text-white',
      onClick: () => console.log('Relatórios')
    },
    {
      icon: Download,
      title: 'Exportar Dados',
      description: 'Baixar relatórios',
      color: 'from-green-500 to-green-600',
      iconColor: 'text-white',
      onClick: () => console.log('Exportar')
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Configurar loja',
      color: 'from-gray-500 to-gray-600',
      iconColor: 'text-white',
      onClick: () => console.log('Configurações')
    }
  ];

  return (
    <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="h-auto p-4 bg-transparent hover:bg-brand-dark-lighter border-2 border-gray-600 hover:border-brand-green/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4 w-full">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{action.title}</h3>
                    {action.badge && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
