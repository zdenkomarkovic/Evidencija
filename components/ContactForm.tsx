"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMail } from "@/lib/send-mail";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Molimo unesite vase ime i prezime" }),
  phone: z.string().min(2, { message: "Molimo unesite vas broj telefona" }),
  email: z.string().email({ message: "Molimo unesite vasu email adresu" }),
  message: z.string().min(10, {
    message: "Poruka mora imati najmanje 10 karaktera.",
  }),
});
export default function ContactForm() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    const mailText = `Ime: ${values.name}\n Telefon: ${values.phone}\n Email: ${values.email}\n Poruka: ${values.message}`;
    const response = await sendMail({
      email: values.email,
      subject: "New Contact Us Form",
      text: mailText,
    });

    if (response?.messageId) {
      toast.success("Application Submitted Successfully.");
    } else {
      toast.error("Failed To send application.");
    }
    form.reset();
  };
  return (
    <div className="">
      <Form {...form}>
        <form
          className="grid grid-cols-3 items-center p-4 lg:p-10 shadow-xl shadow-primary rounded-xl"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="col-span-3 flex flex-col gap-4 lg:col-span-3 lg:gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="lg:text-xl">Ime i Prezime:</FormLabel>

                  <FormControl>
                    <Input placeholder="Unesite ime i prezime" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="lg:text-xl">Broj telefona:</FormLabel>
                  <FormControl>
                    <Input placeholder="Unesite vas broj telefona" {...field} />
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
                  <FormLabel className="lg:text-xl">Email:</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
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
                  <FormLabel className="lg:text-xl  ">Vasa poruka:</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Vasa poruka za nas"
                      className="text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isLoading}
              className="bg-primary  hover:bg-gray-600 transition-colors ease-in-out duration-500"
            >
              {isLoading ? "Sending....." : "Send"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
