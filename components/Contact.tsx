'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['The Smile Hub', 'Kandy Road, colombo'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+94 77 234 5678'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['smilehublanka@gmail.com'],
  },
  {
    icon: Clock,
    title: 'Opening Hours',
    details: ['Mon - Sun: 9:00 AM - 9:00 PM'],
  },
];

/**
 * Contact: Explicitly exported as a named function to match the import 
 * in app/page.tsx: import { Contact } from '@/components/Contact'
 */
export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      // Sends message to the /api/contacts endpoint which saves to Firestore
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('Message sent successfully!', {
          description: 'Our team will review your inquiry and get back to you soon.',
        });
        form.reset();
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-4">
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in{' '}
            <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Have questions or need more information? We are here to help.
            Reach out to us through any of the channels below or visit our clinic.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-sky-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-0 shadow-xl overflow-hidden group">
              <div className="relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.034734898444!2d79.98230777587816!3d6.879505718842429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae251007488e535%3A0x4f0b924fd51a35ba!2sThe%20Smile%20Hub%20-%20Dental%20Hospital%20%26%20dental%20impant%20center%20Athurugiriya%20(By%20Dr%20M.K%20Ovitigala)!5e0!3m2!1sen!2slk!4v1740019543122!5m2!1sen!2slk"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="The Smile Hub Location"
                  className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute top-4 right-4">
                  <a href="https://www.google.com/maps/place/The+Smile+Hub+-+Dental+Hospital+%26+dental+impant+center+Athurugiriya+(By+Dr+M.K+Ovitigala)/@6.8795005,79.9848827,16z" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="secondary" className="shadow-lg rounded-full h-8 px-3 text-[10px] font-bold uppercase tracking-wider">
                      Open in Maps <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardContent className="p-6 md:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>

              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. Our team will get back to you soon at the email address provided.
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="border-sky-200 text-sky-600 hover:bg-sky-50 rounded-full"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Your Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Full Name"
                              className="border-gray-200 focus:ring-sky-500 rounded-xl py-6"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="border-gray-200 focus:ring-sky-500 rounded-xl py-6"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Your Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your dental concerns or questions..."
                              className="border-gray-200 focus:ring-sky-500 min-h-[150px] resize-none rounded-2xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-7 rounded-2xl text-lg font-bold shadow-lg shadow-sky-100 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
