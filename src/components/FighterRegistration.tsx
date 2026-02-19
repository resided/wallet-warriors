// FightBook - Fighter Registration Form
// Register a new fighter with name, API key, and provider selection

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  User, Key, AlertCircle, Loader2, CheckCircle2, 
  Bot, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { saveFighter, isUsingSupabase } from '@/lib/fighterStorage';
import { toast } from 'sonner';

// Validation schema
const fighterSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(30, 'Name must be 30 characters or less')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Name can only contain letters, numbers, and spaces'),
  apiKey: z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .refine((val) => {
      // Basic validation - OpenAI keys start with sk-, Anthropic with sk-ant-
      return val.startsWith('sk-') || val.startsWith('sk-ant-');
    }, 'Invalid API key format. OpenAI keys start with "sk-"'),
  provider: z.enum(['openai', 'anthropic']),
});

type FighterFormData = z.infer<typeof fighterSchema>;

interface FighterRegistrationProps {
  onSuccess?: () => void;
}

export default function FighterRegistration({ onSuccess }: FighterRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FighterFormData>({
    resolver: zodResolver(fighterSchema),
    defaultValues: {
      name: '',
      apiKey: '',
      provider: 'openai',
    },
  });

  const onSubmit = async (data: FighterFormData) => {
    setIsSubmitting(true);
    
    try {
      await saveFighter(data.name, data.apiKey, data.provider);
      
      toast.success(`${data.name} has been registered!`, {
        description: isUsingSupabase() 
          ? 'Saved to your database' 
          : 'Saved to local storage',
      });
      
      form.reset();
      onSuccess?.();
      
      // Navigate to fighters page after success
      navigate('/fighters');
    } catch (error) {
      toast.error('Failed to register fighter', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-display text-lg text-white">Register Fighter</h3>
              <p className="text-xs text-zinc-500">Add your AI agent to the arena</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Fighter Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Fighter Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Knockout King"
                      className="bg-zinc-900 border-zinc-800 text-white"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Provider Selection */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    AI Provider
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="openai" id="openai" className="border-zinc-600" />
                        <Label htmlFor="openai" className="cursor-pointer text-zinc-300">
                          OpenAI
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anthropic" id="anthropic" className="border-zinc-600" />
                        <Label htmlFor="anthropic" className="cursor-pointer text-zinc-300">
                          Anthropic
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Key */}
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    <Key className="w-4 h-4 inline mr-2" />
                    API Key
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="password"
                        placeholder="sk-..."
                        className="bg-zinc-900 border-zinc-800 text-white pr-10 font-mono"
                        autoComplete="off"
                      />
                      {field.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {field.value.startsWith('sk-') || field.value.startsWith('sk-ant-') ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div className="text-xs text-zinc-500 mt-1">
                    Your API key is encrypted before storage
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register Fighter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Storage Info */}
            <div className="text-center text-xs text-zinc-500">
              {isUsingSupabase() ? (
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Saved to database
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  Using local storage (configure Supabase for persistence)
                </span>
              )}
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
