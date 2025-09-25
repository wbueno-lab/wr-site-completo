// Centralização de imports para otimização
export { supabase } from '@/integrations/supabase/client';
export { supabaseConfig } from '@/integrations/supabase/client';
export type { Database, Tables } from '@/integrations/supabase/types';

// Re-export de hooks comuns
export { useAuth } from '@/contexts/UnifiedAuthContext';
export { useCart } from '@/contexts/CartContext';
export { useRealtime } from '@/contexts/RealtimeContext';
export { useToast } from '@/components/ui/use-toast';

// Re-export de componentes UI comuns
export { Button } from '@/components/ui/button';
export { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export { Badge } from '@/components/ui/badge';
export { Alert, AlertDescription } from '@/components/ui/alert';
