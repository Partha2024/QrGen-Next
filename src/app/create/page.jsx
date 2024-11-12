"use client";

import { React, useState, useEffect, Suspense } from "react";
import "./page.css";

import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react"
import { useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ColorPicker } from '@/components/ui/color-picker';

import { cn } from "@/lib/utils"

const formSchema = z.object({
  qrCodeName: z.string().min(2, {
    message: "QR code name must be at least 2 characters.",
  }),
  qrExperience: z.enum(["url", "sms"]),
  qrCodeType: z.enum(["dynamic", "static"]),
  url: z.string().optional(),
  phoneNumber: z.string().optional(),
  smsBody: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.qrExperience === "url" && !data.url) {
    ctx.addIssue({
      path: ["url"],
      message: "URL is required when QR code type is URL",
    });
  }
  if (data.qrExperience === "sms") {
    if (!data.phoneNumber) {
      ctx.addIssue({
        path: ["phoneNumber"],
        message: "Phone number is required when QR code type is SMS",
      });
    }
    if (!data.smsBody) {
      ctx.addIssue({
        path: ["smsBody"],
        message: "SMS body is required when QR code type is SMS",
      });
    }
  }
});

function CreateQRComponent() {

  const [qrImageSrc, setQrImageSrc] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qrCodeName: "",
      qrExperience: "url",
      qrCodeType: "dynamic",
      url: "",
      phoneNumber: "",
      smsBody: "",
      qrCodeColor: "#000000",
      qrCodeBackgroundColor: "#ffffff", 
    },
  });

  async function onSubmit(values) {
    // Prepare data to be sent to the API
    console.log("values", values);
    // const qrData = values.qrExperience === "url" ? values.url : `SMSTO:${values.phoneNumber}:${values.smsBody}`;
    var uidFromUrl = "";
    const payload = {
      ...values,
      qrCodeColor,
      qrCodeBackgroundColor,
      uidFromUrl,
    };
    console.log("payload", payload);
  
    try {
      const response = await fetch("/api/generateQr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const { qrCodeUrl, generatedQrCode, identifier } = await response.json();
        console.log("QR Code generated:", qrCodeUrl);
        window.location.href = "/edit?uid=" + identifier;
        setQrImageSrc(generatedQrCode);
      } else {
        console.error("Failed to generate QR code:", await response.text());
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }
  
  function downloadQrCode(qrImageSrc) {
    const link = document.createElement("a");
    link.href = qrImageSrc;
    link.download = qrCodeUrl+".png";
    link.click();
  }

  const qrExperience = form.watch("qrExperience");
  const qrCodeTypes = [
    { label: "URL", value: "url" },
    { label: "SMS", value: "sms" },
  ];

  const [qrCodeColor, setqrCodeColor] = useState('#000');
  const [qrCodeBackgroundColor, setqrCodeBackgroundColor] = useState('#fff');

  const qrExperienceFromURL = useSearchParams().get("qr") || "url";
  useEffect(() => {
    form.setValue("qrExperience", qrExperienceFromURL);
  }, [qrExperienceFromURL, form]);

  return (
    <section id="createPage">
      <div className="formDiv createPageCard">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} 
          // className="space-y-1"
          >
            <FormField control={form.control} name="qrExperience"
              render={({ field }) => (
                // <FormItem className="flex flex-row items-center">
                  <FormItem className="flex flex-col mb-4">
                  <FormLabel className="mr-1">QR Experience</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? qrCodeTypes.find((qrExperience) => qrExperience.value === field.value)?.label : qrCodeTypes[0].label}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {qrCodeTypes.map((qrExperience) => (
                              <CommandItem value={qrExperience.label} key={qrExperience.value}
                                onSelect={() => {form.setValue("qrExperience", qrExperience.value)}}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    qrExperience.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {qrExperience.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="qrCodeType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  {/* <FormLabel>Notify me about...</FormLabel> */}
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue="dynamic" className="flex space-y-1 mb-4">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dynamic" />
                        </FormControl>
                        <FormLabel> Dynamic</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="static" />
                        </FormControl>
                        <FormLabel >Static</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator className="my-5" />  

            <FormField control={form.control} name="qrCodeName"
              render={({ field }) => (
                // <FormItem className="flex flex-row items-center mb-2">
                <FormItem className="flex flex-col">
                  <FormLabel className="mr-0">QR Code Name : </FormLabel>
                  <FormControl>
                    <Input 
                    // className="w-72" 
                    // onChangeCapture={e => onChange(e.currentTarget.value)} 
                    placeholder="Enter QR Code Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="designOptions">
              <Label className="mt-5">Design</Label> <br/>
              <div className="design-color flex space-x-2">
                <Label className="mt-4 text-muted-foreground" htmlFor="terms">QR Code Color </Label>
                <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg"
                  onChange={(v) => {
                    setqrCodeColor(v);
                  }}
                  value={qrCodeColor}
                />
              </div>
              <div className="design-bg-color flex space-x-2">
                <Label className="mt-4 text-muted-foreground" htmlFor="terms">Background Color</Label>
                <ColorPicker name="qrBgColor" className="mt-2 w-8 h-8 rounded-lg"
                  onChange={(v) => {
                    setqrCodeBackgroundColor(v);
                  }}
                  value={qrCodeBackgroundColor}
                />
              </div>

            </div>
            <Separator className="my-5" /> 
            
            {qrExperience === "url" && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter URL"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {qrExperience === "sms" && (
              <>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mb-4">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Phone Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsBody"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>SMS Body</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter SMS Body"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <Button className="mt-4" type="submit">Generate QR</Button>
          </form>
        </Form>
      </div>
      <div className="qrDiv createPageCard">  
      <div className="qrImage">
      {qrImageSrc ? (
          <img src={qrImageSrc} alt="QR Code" className="w-full h-auto" />
        ) : (
          <div className="placeholder">
              <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Placeholder"
                  alt="Placeholder QR Code"
                  className="w-full h-auto blur p-[20px]"
              />
          </div>
        )}
      </div>
      {qrImageSrc && (
        <Button className="mt-4" onClick={() => downloadQrCode(qrImageSrc)}>Download</Button>
      )}
    </div>
    </section>
  );
}

function Create() {
  return (
    <Suspense fallback={<div><LoaderCircle className="loadingSpinner mx-auto" /></div>}>
      <CreateQRComponent />
    </Suspense>
  );
}

export default Create;
