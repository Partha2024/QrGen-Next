"use client";

import { React, useState, useEffect, Suspense, useRef } from "react";
import "./page.css";

import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
// import ImageTracer from "image-tracer-js";
import ImageTracer from "imagetracerjs";
import { DesignOptions } from "@/app/create/component/designOptions";
import ClientQR from "@/app/edit/component/ClientQR";
import { saveAs } from "file-saver";

//defining form schema and error messages
const formSchema = z
  .object({
    qrCodeName: z.string().min(2, {
      message: "QR code name must be at least 2 characters.",
    }),
    qrExperience: z.enum(["url", "sms"]),
    qrCodeType: z.enum(["dynamic", "static"]),
    url: z.string().optional(),
    phoneNumber: z.string().optional(),
    smsBody: z.string().optional(),
  })
  .superRefine((data, ctx) => {
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

const extensions = [
  {
    value: "png",
    label: "PNG",
  },
  {
    value: "jpeg",
    label: "JPEG",
  },
  {
    value: "webp",
    label: "WEBP",
  },
  {
    value: "svg",
    label: "SVG",
  },
];

//created an seperate function because of suspense issue
function EditQRComponent() {
  const [qrCodeName, setQrCodeName] = useState("qrcode");
  const [qrCodeTypeEx, setQrCodeTypeEx] = useState("");
  const [isUpdated, setIsUpdated] = useState("false");

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
  const [qrImageSrc, setQrImageSrc] = useState("");
  const [qrCodeColor, setqrCodeColor] = useState("#000");
  const [qrCodeBackgroundColor, setqrCodeBackgroundColor] = useState("#fff");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("png");
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
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 4,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    dotsOptions: {
      type: "square",
      color: "#000000",
      roundSize: true,
    },
    backgroundOptions: {
      round: 0,
      color: "#fff",
    },
    dotsOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#6a1a4c",
        color2: "#6a1a4c",
        rotation: "0",
      },
    },
    cornersSquareOptions: {
      type: "square",
      color: "#000000",
      gradient: null,
    },
    cornersSquareOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    cornersDotOptions: {
      type: "",
      color: "#000000",
    },
    cornersDotOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    backgroundOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#ffffff",
        color2: "#ffffff",
        rotation: "0",
      },
    },
  });
  const [payload, setPayload] = useState(designData);

  function handleDesignDataChange(data) {
    setDesignData(data);
  }

  //getting uid from url
  const uidFromUrl = useSearchParams().get("uid");

  async function fetchQrData(uid) {
    setLoading(true);
    try {
      let url = `/api/getQrData?uid=${encodeURIComponent(uid)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching QR codes");
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
      // console.log("🚀 ~ data:", data)
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
      setqrCodeBackgroundColor(data.design_bg_color || "#0064ff");
      setQrImageSrc(data.qr_image);
    });
  }, [uidFromUrl, form]);

  const [onSubmitLoader, setOnSubmitLoader] = useState(false);
  //handling form submit
  async function onUpdate(values) {
    setOnSubmitLoader(true);
    let redirectionUrl = `https://qrgen-prod.vercel.app/api/redirect/${uidFromUrl}`;
    if (values.qrCodeType === "dynamic" || values.qrExperience === "sms") {
      designData.data = redirectionUrl;
    } else {
      designData.data = values.url.startsWith("http")
        ? values.url
        : `http://${values.url}`;
    }

    setPayload(designData);

    setTimeout(async () => {
      const canvas = await html2canvas(document.getElementById("qrImageDiv"));
      const dataUrl = canvas.toDataURL("image/png");
      let dbDataUrl = dataUrl === "data:," ? qrImageSrc : dataUrl;
      form.clearErrors();
      const dbData = {
        ...values,
        uidFromUrl,
        qrCodeColor: designData.dotsOptions.color,
        qrCodeBackgroundColor: designData.backgroundOptions.color,
        qrImage: dbDataUrl,
        qrUrl: designData.data,
      };

      //calling createQr api to create qr code
      try {
        const response = await fetch("/api/createQr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dbData),
        });
        if (response.ok) {
          setIsUpdated(false);
          setOnSubmitLoader(false);
          toast("Success!!", {
            description: "QR Code Updated Successfully",
          });
        } else {
          console.error("Failed to Update QR code(F):", await response.text());
        }
      } catch (error) {
        console.error("Error Updating QR code(F):", error);
      }
    }, 1000);
  }

  //function handle qr code download
  async function downloadQrCode(qrImageSrc) {
    if (value === "svg") {
      try {
        const response = await fetch(qrImageSrc);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = async function () {
          const base64Image = reader.result;
          const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
              <image href="${base64Image}" width="100%" height="100%" />
            </svg>
          `;
          const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
          saveAs(svgBlob, "qr-code.svg");

          // ImageTracer.imageToSVG(reader.result, function (svgData) {
          //   if (!svgData.includes("<svg")) {
          //     console.error("🚨 Invalid SVG data:", svgData);
          //     return;
          //   }

          //   const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
          //   const url = URL.createObjectURL(svgBlob);
          //   const link = document.createElement("a");
          //   link.href = url;
          //   link.download = qrCodeName+".svg";
          //   document.body.appendChild(link);
          //   link.click();
          //   document.body.removeChild(link);
          //   URL.revokeObjectURL(url);
          // });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("🚨 Error converting to SVG:", error);
      }
    } else {
      const link = document.createElement("a");
      link.href = qrImageSrc;
      link.download = qrCodeName + "." + value;
      link.click();
    }
  }

  //getting form values
  const qrExperience = form.watch("qrExperience");
  const qrExperienceTypes = [
    { label: "URL", value: "url" },
    { label: "SMS", value: "sms" },
  ];

  return (
    <div className="h-full w-full">
      {loading == true ? (
        <LoaderCircle className="loadingSpinner mx-auto" />
      ) : (
        <section id="createPage" className="flex p-6 justify-between h-full ">
          <Card className="formDiv createPageCard min-w-[69%]">
            <CardContent className="p-6 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdate)}>
                  <fieldset disabled={onSubmitLoader}>
                    <FormField
                      control={form.control}
                      name="qrExperience"
                      render={({ field }) => (
                        <FormItem className="flex flex-col mb-4">
                          <FormLabel className="mr-1">QR Experience</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[200px] justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={qrCodeTypeEx === "static"}>
                                  {field.value
                                    ? qrExperienceTypes.find(
                                        (qrExperience) =>
                                          qrExperience.value === field.value
                                      )?.label
                                    : qrExperienceTypes[0].label}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    {qrExperienceTypes.map((qrExperience) => (
                                      <CommandItem
                                        value={qrExperience.label}
                                        key={qrExperience.value}
                                        onSelect={() => {
                                          form.setValue(
                                            "qrExperience",
                                            qrExperience.value
                                          );
                                        }}>
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
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={form.watch("qrCodeType")}
                              disabled
                              className="flex space-y-1 mb-4">
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

                    <FormField
                      control={form.control}
                      name="qrCodeName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-0">
                            QR Code Name :{" "}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter QR Code Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-5" />

                    <DesignOptions
                      name="qrColor"
                      className="mt-2 w-8 h-8 rounded-lg"
                      value={designData}
                      onChange={handleDesignDataChange}
                    />

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
                                disabled={qrCodeTypeEx === "static"}
                                value={form.watch("url")}
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

                    <Button className="mt-4" type="submit">
                      Update
                      {onSubmitLoader && (
                        <LoaderCircle className="loadingSpinner ml-1" />
                      )}
                    </Button>
                  </fieldset>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="qrDiv createPageCard min-w-[29%] flex justify-center items-center" >
            <CardContent>
              {isUpdated ? (
                <div>
                  <img
                    src={qrImageSrc}
                    alt="QR Code"
                    className="max-w-[220px] max-h-[220px] w-[220px] h-[220px ]"
                    id="imageeeeee"
                  />
                  <div className="flex flex-col items-center gap-2 mt-10">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[100px] justify-between">
                          {value
                            ? extensions.find(
                                (framework) => framework.value === value
                              )?.label
                            : "Select framework..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[100px] p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {extensions.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    setValue(
                                      currentValue === value ? "" : currentValue
                                    );
                                    setOpen(false);
                                  }}>
                                  {framework.label}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      value === framework.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button onClick={() => downloadQrCode(qrImageSrc)}>
                      Download
                    </Button>
                  </div>
                  <div className="hidden">
                    <ClientQR options={payload} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ClientQR options={payload} qrCodeName={qrCodeName} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function Edit() {
  return (
    <Suspense
      fallback={
        <div>
          <LoaderCircle className="loadingSpinner mx-auto" />
        </div>
      }>
      <EditQRComponent />
    </Suspense>
  );
}

export default Edit;
