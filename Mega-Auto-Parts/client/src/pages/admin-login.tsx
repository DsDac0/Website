import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Корисничкото име е задолжително"),
  password: z.string().min(1, "Лозинката е задолжителна"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      return await apiRequest("POST", "/api/admin/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Успешна најава",
        description: "Добредојдовте во администраторски панел",
      });
      setLocation("/admin/orders");
    },
    onError: (error: any) => {
      toast({
        title: "Грешка при најава",
        description: "Невалидно корисничко име или лозинка",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Админ панел</CardTitle>
          <CardDescription>
            Најавете се со вашите администраторски податоци
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Корисничко име</Label>
              <Input
                id="username"
                type="text"
                {...form.register("username")}
                placeholder="Внесете корисничко име"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Лозинка</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Внесете лозинка"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Се најавувате..." : "Најави се"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}