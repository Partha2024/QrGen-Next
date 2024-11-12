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
import { toast } from "sonner";

import { cn } from "@/lib/utils"

//defining form schema and error messages
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


//created an seperate function because of suspense issue
function EditQRComponent() {

  const[qrCodeName, setQrCodeName] = useState("qrcode");
  const[qrCodeTypeEx, setQrCodeTypeEx] = useState("");

  //defining form and default values
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

  const [loading, setLoading] = useState(true);
  
  //useState to update qrImageSrc after qr generation
  const [qrImageSrc, setQrImageSrc] = useState("");

  //useState to get qrCodeColor and qrCodeBackgroundColor
  const [qrCodeColor, setqrCodeColor] = useState('#000');
  const [qrCodeBackgroundColor, setqrCodeBackgroundColor] = useState('#fff');
  
  //getting uid from url
  const uidFromUrl = useSearchParams().get("uid");

  async function fetchQrData(uid) {
    setLoading(true);
    try {
      let url = `/api/getQrData?uid=${encodeURIComponent(uid)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching QR codes');
      }
      // Parse and return the JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQrData(uidFromUrl).then((data) => {
      setQrCodeName(data.qr_code_name);
      console.log("🚀 ~ data:", data);
      setQrCodeTypeEx(data.qr_code_type);
      form.reset({
        qrCodeName: data.qr_code_name,
        qrExperience: data.qr_experience,
        qrCodeType: data.qr_code_type,
        url: data.content_url || "",
        phoneNumber: data.content_phone_number || "",
        smsBody: data.content_sms_body || "",
      });
      form.clearErrors();
      setqrCodeColor(data.design_qr_color);
      setqrCodeBackgroundColor( data.design_bg_color || "#0064ff");
      setQrImageSrc(data.qr_image);
    });
  },[uidFromUrl, form]);

  //handling form submit
  async function onUpdate(values) {
    form.clearErrors();
    const payload = {
      ...values,
      qrCodeColor,
      qrCodeBackgroundColor,
      uidFromUrl
    };
    console.log("🚀 ~ onUpdate ~ payload:", payload)
    //calling generateQr api to create qr code
    try {
      const response = await fetch("/api/generateQr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const { qrCodeUrl, generatedQrCode } = await response.json();
        console.log("QR Code generated:", qrCodeUrl);
        setQrImageSrc(generatedQrCode);
        toast("Success!!", {
          description: "QR Code Updated Successfully",
        })
      } else {
        console.error("Failed to Update QR code:", await response.text());
      }
    } catch (error) {
      console.error("Error Updating QR code:", error);
    }
  }
  
  //function handle qr code download
  function downloadQrCode(qrImageSrc) {
    const link = document.createElement("a");
    link.href = qrImageSrc;
    link.download = qrCodeName+".png";
    link.click();
  }

  //getting form values
  const qrExperience = form.watch("qrExperience");
  const qrExperienceTypes = [
    { label: "URL", value: "url" },
    { label: "SMS", value: "sms" },
  ];

  return (
    <div className="h-full">
      {loading==true ? (
        <LoaderCircle className="loadingSpinner mx-auto" />
      ) : (
        <section id="createPage">
          <div className="formDiv createPageCard">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdate)} >
                <FormField control={form.control} name="qrExperience"
                  render={({ field }) => (
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
                              disabled={qrCodeTypeEx === "static"}
                            >
                              {field.value ? qrExperienceTypes.find((qrExperience) => qrExperience.value === field.value)?.label : qrExperienceTypes[0].label}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {qrExperienceTypes.map((qrExperience) => (
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
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={form.watch("qrCodeType")} disabled className="flex space-y-1 mb-4">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="dynamic" />
                            </FormControl>
                            <FormLabel>Dynamic</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="static" />
                            </FormControl>
                            <FormLabel>Static</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator className="my-5" />  

                <FormField control={form.control} name="qrCodeName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mr-0">QR Code Name : </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter QR Code Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="designOptions">
                  <Label className="mt-5">Design</Label> <br/>
                  <div className="design-color flex space-x-2">
                    <Label className="mt-4 text-muted-foreground" htmlFor="terms">QR Code Color</Label>
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
                          <Input disabled={qrCodeTypeEx === "static"} value={form.watch("url")} placeholder="Enter URL"
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
                              disabled={qrCodeTypeEx === "static"}
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
                              disabled={qrCodeTypeEx === "static"}
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
                
                <Button className="mt-4" type="submit">Update</Button>
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
      )}
    </div>
  );
}

function Edit() {
  return (    
    <Suspense fallback={<div><LoaderCircle className="loadingSpinner mx-auto" /></div>}>
      <EditQRComponent />
    </Suspense>
  );
}

export default Edit;