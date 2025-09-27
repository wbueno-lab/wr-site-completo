import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, MessageSquare, User } from "lucide-react";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  helpful_count: number;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    user_name: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar produtos",
        variant: "destructive"
      });
      return;
    }

    // Validar comentário
    if (!newReview.comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário sobre o produto",
        variant: "destructive"
      });
      return;
    }

    if (newReview.comment.length < 10) {
      toast({
        title: "Comentário muito curto",
        description: "O comentário deve ter pelo menos 10 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (newReview.comment.length > 1000) {
      toast({
        title: "Comentário muito longo",
        description: "O comentário deve ter no máximo 1000 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o usuário já avaliou este produto
    try {
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        toast({
          title: "Avaliação já existe",
          description: "Você já avaliou este produto",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      // Ignorar erro se não encontrar avaliação existente
    }

    setSubmitting(true);
    try {
      const sanitizedComment = newReview.comment
        .trim()
        .replace(/[<>]/g, '') // Remover tags HTML
        .slice(0, 1000); // Limitar tamanho

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          comment: sanitizedComment,
          user_name: user.email.split('@')[0] // Use email prefix as name
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pela sua avaliação"
      });

      setNewReview({ rating: 5, comment: "", user_name: "" });
      setShowReviewForm(false);
      await fetchReviews();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ helpful_count: (reviews.find(r => r.id === reviewId)?.helpful_count || 0) + 1 })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/6"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Avaliações ({reviews.length})
            </CardTitle>
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Avaliar Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Avaliar Produto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Avaliação</Label>
                    <Select
                      value={newReview.rating.toString()}
                      onValueChange={(value) => setNewReview({ ...newReview, rating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Estrelas - Excelente</SelectItem>
                        <SelectItem value="4">4 Estrelas - Muito Bom</SelectItem>
                        <SelectItem value="3">3 Estrelas - Bom</SelectItem>
                        <SelectItem value="2">2 Estrelas - Regular</SelectItem>
                        <SelectItem value="1">1 Estrela - Ruim</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      {renderStars(newReview.rating, "lg")}
                      <span className="text-sm text-muted-foreground">
                        {newReview.rating} estrelas
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comentário</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      placeholder="Compartilhe sua experiência com este produto..."
                      value={newReview.comment}
                      autoComplete="off"
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {/* Average Rating */}
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="space-y-1">
                  {renderStars(Math.round(averageRating), "lg")}
                  <div className="text-sm text-muted-foreground">
                    Baseado em {reviews.length} avaliações
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{review.user_name}</span>
                        {renderStars(review.rating, "sm")}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpful(review.id)}
                        className="text-xs"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Útil ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
              <p className="text-sm">Seja o primeiro a avaliar este produto!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;
