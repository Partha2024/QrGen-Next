"use client";

import { React, useState, useEffect, Suspense, useRef } from "react";
import "./page.css";

import { Check, ChevronsUpDown, LoaderCircle, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DesignOptions } from "@/app/create/component/designOptions";
import ClientQR from "@/app/create/component/ClientQR";

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

const qrCodeTypes = [
  { label: "URL", value: "url" },
  { label: "SMS", value: "sms" },
];

function CreateQRComponent() {

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qrCodeName: "",
      qrExperience: "url",
      qrCodeType: "dynamic",
      url: "",
      phoneNumber: "",
      smsBody: "",
    },
  });

  const [qrImageSrc, setQrImageSrc] = useState("");
  const [payload, setPayload] = useState("");
  const qrExperience = form.watch("qrExperience");
  const qrExperienceFromURL = useSearchParams().get("qr") || "url";
  const [designData, setDesignData] = useState({
    width: 220,
    height: 220,
    type: "svg",
    image: "",
    data: "https://example.com",
    margin: 10,
    qrOptions: {
      typeNumber: "0",
      mode: "Byte",
      errorCorrectionLevel: "Q"
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 4,
      crossOrigin: 'anonymous',
      saveAsBlob: true,
    },
    dotsOptions: {
      type: "square",
      color: "#000000",
      roundSize: true
    },
    backgroundOptions: {
      round: 0,
      color: "#fff"
    },
    dotsOptionsHelper: {
      colorType: {
        single: true,
        gradient: false
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#6a1a4c",
        color2: "#6a1a4c",
        rotation: "0"
      }
    },
    cornersSquareOptions: {
      type: "square",
      color: "#000000",
      gradient: null
    },
    cornersSquareOptionsHelper: {
      colorType: {
        single: true,
        gradient: false
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0"
      }
    },
    cornersDotOptions: {
      type: "",
      color: "#000000"
    },
    cornersDotOptionsHelper: {
      colorType: {
        single: true,
        gradient: false
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0"
      }
    },
    backgroundOptionsHelper: {
      colorType: {
        single: true,
        gradient: false
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#ffffff",
        color2: "#ffffff",
        rotation: "0"
      }
    }
  });
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);

  function handleDesignDataChange(data){
    setDesignData(data);
  }

  async function onSubmit(values) {
    setOnSubmitLoader(true);
    // console.log("values", values);
    var uidFromUrl = "";
    let uniqueId = values.qrCodeType==="dynamic" ? new Date().getTime().toString() : "sta" + new Date().getTime().toString() + "tic";
    let redirectionUrl = `https://qrgen-prod.vercel.app/api/redirect/${uniqueId}`; //prod url

    if (values.qrCodeType === "dynamic" || values.qrExperience === "sms") {
      designData.data = redirectionUrl;
    } else {
      designData.data = values.url.startsWith("http") ? values.url : `http://${values.url}`;
    }
    setPayload(designData);
    // console.log("payload", payload);

    setTimeout( async () => {
      const canvas = await html2canvas(document.getElementById("qrImageDiv"));
      const dataUrl = canvas.toDataURL("image/png"); // Convert to base64;
      setQrImageSrc(dataUrl);
      const dbData = {
        ...values,
        uniqueId,
        qrCodeColor: designData.dotsOptions.color,
        qrCodeBackgroundColor: designData.backgroundOptions.color,
        uidFromUrl,
        qrImage: dataUrl,
        qrUrl: designData.data
      };

      try {
        // const response = await fetch("/api/generateQr", {
        const response = await fetch("/api/createQr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dbData),
        });
        if (response.ok) {
          // console.log("QR Code generated:");
          toast("Success!!", {
            description: "QR Code Created Successfully",
          })
          window.location.href = "/edit?uid=" + uniqueId;
          setOnSubmitLoader(true);
        } else {
          console.error("Failed to generate QR code:", await response.text());
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }

    },100)
  }

  useEffect(() => {
    form.setValue("qrExperience", qrExperienceFromURL);
  }, [qrExperienceFromURL, form]);

  return (
    <section id="createPage" className="w-full flex p-6 justify-center items-center">
      <Card className="formDiv createPageCard w-full">
        <CardContent className="p-6 pt-4">
          <Form {...form}  >
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={onSubmitLoader}>
              <FormField control={form.control} name="qrExperience"
                render={({ field }) => (
                  <FormItem className="flex mb-4 items-center">
                    <FormLabel className="mr-1 mt-[4px] pr-2">QR Experience</FormLabel>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qrCodeType"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormLabel className="mt-[4px]">QR Code Type</FormLabel>
                    <FormControl className="ml-4">
                      <RadioGroup onValueChange={field.onChange} defaultValue="dynamic"
                      className="flex mb-4 space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dynamic" />
                          </FormControl>
                          <FormLabel>Dynamic</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
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
                    <FormLabel className="mr-0">QR Code Name</FormLabel>
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

              <Separator className="my-5" />

              <DesignOptions name="qrColor" className="mt-2 w-8 h-8 rounded-lg" value={designData} onChange={handleDesignDataChange} />

              <Separator className="my-5" />

              {qrExperience === "url" && (
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter URL" {...field} />
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
              <Button className="mt-8" type="submit" disabled={onSubmitLoader}>
                Generate QR
                {onSubmitLoader && <LoaderCircle className="loadingSpinner ml-1" />}
              </Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="p-0">
          <div className="hidden">
            <ClientQR options={payload}/>
          </div>
        </CardFooter>
      </Card>
      {/* <div className="qrDiv createPageCard">
        <div className="qrImage">
        {qrImageSrc ? (
            <img src={qrImageSrc} alt="QR Code" className="w-full h-auto" />
          ) : (
            <div className="placeholder">
              <ClientQR options={payload}/>
            </div>
          )}
        </div>
      </div> */}
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
