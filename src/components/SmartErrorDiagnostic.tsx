import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  RefreshCw,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { ConsoleErrorDetector, testBasicConnectivity, ErrorAnalysis } from '@/utils/consoleErrorDetector';

interface DiagnosticResult {
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  analysis: Array<ErrorAnalysis & { count: number; examples: string[] }>;
  recommendations: string[];
  connectivity: {
    success: boolean;
    errors: string[];
    details: Record<string, any>;
  };
}

const SmartErrorDiagnostic: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [capturedErrors, setCapturedErrors] = useState<string[]>([]);

  // Capturar erros do console automaticamente
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.map(arg => String(arg)).join(' ');
      setCapturedErrors(prev => [...prev.slice(-49), message]); // Manter últimos 50
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => String(arg)).join(' ');
      setCapturedErrors(prev => [...prev.slice(-49), message]); // Manter últimos 50
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Testar conectividade básica
      const connectivity = await testBasicConnectivity();
      
      // Analisar erros capturados
      const report = ConsoleErrorDetector.generateDiagnosticReport(capturedErrors);
      
      setResult({
        summary: report.summary,
        analysis: report.analysis,
        recommendations: report.recommendations,
        connectivity
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityIcon = (severity: ErrorAnalysis['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ErrorAnalysis['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getTypeIcon = (type: ErrorAnalysis['type']) => {
    switch (type) {
      case 'csp':
        return '🛡️';
      case 'cors':
        return '🌐';
      case 'network':
        return '📡';
      case 'javascript':
        return '⚡';
      case 'supabase':
        return '🗄️';
      default:
        return '❓';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      analysis: result.analysis,
      recommendations: result.recommendations,
      connectivity: result.connectivity,
      capturedErrors: capturedErrors
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Diagnóstico Inteligente de Erros
          </CardTitle>
          <CardDescription>
            Análise automática de erros do console com recomendações de correção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analisando...' : 'Executar Análise'}
              </Button>
              
              <Badge variant="outline">
                {capturedErrors.length} erros capturados
              </Badge>
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Relatório
                </Button>
              </div>
            )}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analisando erros e testando conectividade...</span>
                <span>Processando...</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Resumo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo da Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {result.summary.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.summary.critical}
                      </div>
                      <div className="text-sm text-muted-foreground">Críticos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {result.summary.high}
                      </div>
                      <div className="text-sm text-muted-foreground">Altos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {result.summary.medium}
                      </div>
                      <div className="text-sm text-muted-foreground">Médios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.summary.low}
                      </div>
                      <div className="text-sm text-muted-foreground">Baixos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status de Conectividade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className={`h-5 w-5 ${result.connectivity.success ? 'text-green-500' : 'text-red-500'}`} />
                    Status de Conectividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.connectivity.success ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Conectividade OK!</strong> Todos os serviços principais estão acessíveis.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Problemas de conectividade detectados:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {result.connectivity.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Análise Detalhada */}
              {result.analysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análise Detalhada dos Erros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.analysis.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(item.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(item.type)}</span>
                            {getSeverityIcon(item.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.description}</h4>
                              <Badge variant="outline">
                                {item.count}x
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.solution}
                            </p>
                            <div className="text-xs text-muted-foreground mb-2">
                              <strong>Afeta:</strong> {item.affectedFeatures.join(', ')}
                            </div>
                            {item.examples.length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Ver exemplos ({item.examples.length})
                                </summary>
                                <div className="mt-2 space-y-1">
                                  {item.examples.map((example, i) => (
                                    <div key={i} className="bg-black/5 dark:bg-white/5 p-2 rounded font-mono text-xs break-words">
                                      {example}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recomendações */}
              {result.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Recomendações Prioritárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            {recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Soluções Comuns */}
              <Card>
                <CardHeader>
                  <CardTitle>Soluções Comuns</CardTitle>
                  <CardDescription>
                    Guias passo-a-passo para resolver problemas comuns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ConsoleErrorDetector.getCommonSolutions().map((solution, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Badge variant={solution.priority === 'high' ? 'destructive' : 'secondary'}>
                            {solution.priority}
                          </Badge>
                          {solution.title}
                        </h4>
                        <ol className="text-sm space-y-1 text-muted-foreground">
                          {solution.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartErrorDiagnostic;
