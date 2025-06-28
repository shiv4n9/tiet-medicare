
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { Separator } from "@/components/ui/separator";
import GoogleAuth from '@/components/ui/auth/GoogleAuth';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const success = await login(values.email, values.password);
      if (success) {
        toast.success("Logged in successfully!");
        navigate('/');
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to login. Please check your credentials.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true);
      const success = await register(values.name, values.email, values.password);
      if (success) {
        toast.success("Account created successfully! Please log in.");
      } else {
        toast.error("Email already exists. Please use a different email.");
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen bg-gray-50 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleAuth />
                
                <div className="relative my-4">
                  <Separator className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </Separator>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
                
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        {...loginForm.register("email")} 
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Forgot password?
                        </Button>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        {...loginForm.register("password")} 
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-medical-blue-600 hover:bg-medical-blue-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
                <CardDescription className="text-center">
                  Enter your information to create an account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleAuth />
                
                <div className="relative my-4">
                  <Separator className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </Separator>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
                
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        {...signupForm.register("name")} 
                      />
                      {signupForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        {...signupForm.register("email")} 
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        {...signupForm.register("password")} 
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-medical-green-600 hover:bg-medical-green-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Auth;
