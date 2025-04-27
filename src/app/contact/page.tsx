import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us | Letterflow",
  description:
    "Get in touch with the Letterflow team for support, sales inquiries, or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 -z-10" />
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 -z-10" />
          <div className="absolute top-0 left-1/3 w-2/3 h-1/3 bg-gradient-to-r from-primary/10 to-purple-200/20 blur-3xl rounded-full -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
              <p className="text-xl text-muted-foreground">
                We&apos;d love to hear from you. Reach out with questions, feedback, or partnership
                inquiries.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="relative py-12">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Mail className="h-8 w-8" />,
                  title: "Email",
                  description: "For general inquiries",
                  contact: "hello@letterflow.com",
                  action: "Email Us",
                  href: "mailto:hello@letterflow.com",
                },
                {
                  icon: <MessageSquare className="h-8 w-8" />,
                  title: "Live Chat",
                  description: "Chat with our support team",
                  contact: "Available Mon-Fri, 9am-5pm EST",
                  action: "Start Chat",
                  href: "#chat",
                },
                {
                  icon: <Phone className="h-8 w-8" />,
                  title: "Phone",
                  description: "For urgent matters",
                  contact: "+1 (555) 123-4567",
                  action: "Call Us",
                  href: "tel:+15551234567",
                },
              ].map((item: any, index: any) => (
                <Card key={index} className="backdrop-blur-sm bg-white/80 border-border/60">
                  <CardHeader className="pb-2">
                    <div className="mb-4 rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-4">{item.contact}</p>
                    <Button variant="outline" asChild>
                      <a href={item.href}>{item.action}</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="relative py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="backdrop-blur-sm bg-white/80 border-border/60">
                <CardHeader>
                  <CardTitle className="text-center">Send us a Message</CardTitle>
                  <CardDescription className="text-center">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <select
                        id="subject"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Select a subject</option>
                        <option value="support">Support</option>
                        <option value="sales">Sales</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Your message..."
                      ></textarea>
                    </div>

                    <div>
                      <Button className="w-full" size="lg" type="submit">
                        Send Message
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Offices</h2>
              <p className="text-lg text-muted-foreground">
                While we&apos;re primarily remote, we have physical locations in these cities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  city: "New York",
                  address: "123 Broadway, New York, NY 10001",
                  country: "United States",
                },
                {
                  city: "London",
                  address: "456 Oxford Street, London, W1C 1AB",
                  country: "United Kingdom",
                },
                {
                  city: "Singapore",
                  address: "789 Orchard Road, Singapore 238839",
                  country: "Singapore",
                },
              ].map((office: any, index: any) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/60 shadow-sm"
                >
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">{office.city}</h3>
                  </div>
                  <p className="text-muted-foreground">{office.address}</p>
                  <p className="text-muted-foreground">{office.country}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

              <div className="space-y-6">
                {[
                  {
                    question: "How quickly can I expect a response?",
                    answer:
                      "We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please use our live chat or phone options.",
                  },
                  {
                    question: "Do you offer technical support on weekends?",
                    answer:
                      "Our standard support hours are Monday to Friday, 9am-5pm EST. For Enterprise clients, we offer extended support including weekends.",
                  },
                  {
                    question: "Can I schedule a demo of Letterflow?",
                    answer:
                      "Absolutely! You can book a personalized demo with our product specialists through the 'Book a Call' button on our homepage.",
                  },
                  {
                    question: "How do I report a bug or issue?",
                    answer:
                      "You can report bugs through our support portal, email, or by submitting a ticket through the in-app help center.",
                  },
                ].map((faq: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/60 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
