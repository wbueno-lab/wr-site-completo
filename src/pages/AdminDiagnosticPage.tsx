import { AdminDiagnostic } from '@/components/AdminDiagnostic';
import { SimpleAdminDebug } from '@/components/SimpleAdminDebug';
import { QuickAdminTest } from '@/components/QuickAdminTest';
import { AdminProfileFix } from '@/components/AdminProfileFix';
import { ForceAdminSync } from '@/components/ForceAdminSync';
import { AdminBypass } from '@/components/AdminBypass';
import { AdminDebugAdvanced } from '@/components/AdminDebugAdvanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <Home className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          </div>
          
          <div className="mb-6">
            <AdminBypass />
          </div>

          <div className="mb-6">
            <ForceAdminSync />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico do Sistema de Administração</CardTitle>
              <CardDescription>
                Esta página ajuda a diagnosticar problemas de acesso ao painel administrativo.
                Execute o diagnóstico para identificar possíveis problemas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminDiagnostic />
            </CardContent>
          </Card>

          <div className="mt-6">
            <AdminProfileFix />
          </div>

          <div className="mt-6">
            <QuickAdminTest />
          </div>

          <div className="mt-6">
            <SimpleAdminDebug />
          </div>

          <div className="mt-6">
            <AdminDebugAdvanced />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiagnosticPage;

