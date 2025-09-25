import { Skeleton } from '@/components/ui/skeleton';

const LoadingProductDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-20" />
          <span>/</span>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagem */}
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Título e Categoria */}
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>

            {/* Preço */}
            <div>
              <Skeleton className="h-12 w-32 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Numeração */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-12" />
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>

            {/* Card de Entrega */}
            <Skeleton className="h-40 w-full" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-4 mb-6">
            {['Descrição', 'Especificações', 'Avaliações'].map((tab) => (
              <Skeleton key={tab} className="h-10 w-32" />
            ))}
          </div>
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    </div>
  );
};

export default LoadingProductDetail;

