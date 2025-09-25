import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SimpleChartsProps {
  orderStatusCounts: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  salesByDay: Array<{
    day: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

const SimpleCharts = ({ orderStatusCounts, salesByDay, topProducts }: SimpleChartsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getMaxValue = (data: number[]) => Math.max(...data, 1);

  const statusData = [
    { label: 'Pendentes', value: orderStatusCounts.pending, color: 'bg-yellow-500' },
    { label: 'Confirmados', value: orderStatusCounts.confirmed, color: 'bg-blue-500' },
    { label: 'Enviados', value: orderStatusCounts.shipped, color: 'bg-purple-500' },
    { label: 'Entregues', value: orderStatusCounts.delivered, color: 'bg-green-500' },
    { label: 'Cancelados', value: orderStatusCounts.cancelled, color: 'bg-red-500' }
  ];

  const maxSales = getMaxValue(salesByDay.map(item => item.sales));
  const maxRevenue = getMaxValue(salesByDay.map(item => item.revenue));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de Vendas por Dia */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
          <CardTitle className="text-xl font-bold text-white">Vendas por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {salesByDay.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{item.day}</span>
                  <div className="text-right">
                    <p className="text-brand-green font-bold">{item.sales} pedidos</p>
                    <p className="text-gray-400 text-sm">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Pedidos</span>
                    <span>{item.sales}</span>
                  </div>
                  <Progress 
                    value={(item.sales / maxSales) * 100} 
                    className="h-2 bg-gray-700"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Receita</span>
                    <span>{formatPrice(item.revenue)}</span>
                  </div>
                  <Progress 
                    value={(item.revenue / maxRevenue) * 100} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Status dos Pedidos */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
          <CardTitle className="text-xl font-bold text-white">Status dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {statusData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
                <Progress 
                  value={(item.value / Math.max(...statusData.map(s => s.value), 1)) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Produtos Mais Vendidos */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden lg:col-span-2">
        <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
          <CardTitle className="text-xl font-bold text-white">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((product, index) => (
              <div key={index} className="p-4 bg-brand-dark-lighter rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm truncate">
                    {product.name.length > 20 ? `${product.name.slice(0, 20)}...` : product.name}
                  </h3>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Vendas</span>
                    <span className="text-brand-green font-bold text-sm">{product.sales}</span>
                  </div>
                  <Progress 
                    value={(product.sales / Math.max(...topProducts.map(p => p.sales), 1)) * 100} 
                    className="h-1 bg-gray-700"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Receita</span>
                    <span className="text-white font-semibold text-sm">{formatPrice(product.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCharts;
