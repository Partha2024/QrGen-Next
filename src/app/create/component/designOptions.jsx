'use client';

import React, { forwardRef, useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from "@/components/ui/switch"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Trash2, AlertCircle } from "lucide-react";
// import ClientQR from "@/app/qr/ClientQR";
import ClientQR from "@/app/create/component/ClientQR";
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner"

const dotShapes = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots"},
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
]

const errorCorrectionLevels = [
  {value: "L", label: "L", imageSize: "1.2"},
  {value: "M", label: "M", imageSize: "0.6"},
  {value: "Q", label: "Q", imageSize: "0.4"},
  {value: "H", label: "H", imageSize: "0.4"},
]

const DesignOptions = forwardRef( ({
  disabled, value, onChange, onBlur, name, className, ...props
}, forwardedRef) => {

  const contrast = require("get-contrast");

  const [defaultOptions, setDefaultOptions] = useState({
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
      imageSize: "0.4",
      margin: "4",
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
      type: "Square",
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

  const [options, setOptions] = useState({
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
      imageSize: "0.4",
      margin: "1",
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
      type: "Square",
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

  const[showAlert, setShowAlert] = useState(false);

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);

  const [logoSelected, setLogoSelected] = useState(false);
  const [designLogo, setDesignLogo] = useState("");
  const [designLogoMargin, setLogoMargin] = useState("1");
  const [designLogoSize, setLogoSize] = useState("0.4");

  const [designQRColor, setQRColor] = useState("#000000");
  const [designQRBackgroundColor, setQRBackgroundColor] = useState("#fff");

  const [designCornerSquareStyle, setCornerSquareStyle] = useState(null);
  const [designCornerSquareColor, setCornerSquareColor] = useState("#000000");
  const [designCornerDotStyle, setCornerDotStyle] = useState(null);
  const [designCornerDotColor, setCornerDotColor] = useState("#000000");

  const [designDotsStyle, setDotsStyle] = useState("square");

  const [designTypeNumber, setTypeNumber] = useState("0");
  const [designErrorCorrection, setErrorCorrection] = useState();

  const [trasnparentBg, setTrasnparentBg] = useState(false);

  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    if( /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(designQRColor) && /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(designCornerSquareColor) && /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(designCornerDotColor) && /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(designQRBackgroundColor) ){
      if(contrast.ratio(designQRColor, designQRBackgroundColor) < 3) {
        setShowAlert(true);
      } else if(contrast.ratio(designCornerSquareColor, designQRBackgroundColor) < 3) {
        setShowAlert(true);
      }else if(contrast.ratio(designCornerDotColor, designQRBackgroundColor) < 3){
        setShowAlert(true);
      }else{
        setShowAlert(false);
      }
    }
  }, [designQRColor, designCornerSquareColor, designCornerDotColor, designQRBackgroundColor]);

  function handleLogoChange(event) {
    var file = event.target.files[0];
    if(file){
      if(file.size > 1000000){
        file.value = "";
        event.target.value="";
        toast.error("File Size Too Big", {
          description: "Image size should be less then 1MB",
        })
      }else{
        var reader = new FileReader();
        reader.onloadend = function() {
          setDesignLogo(reader.result);
          setOptions((options) => ({
            ...options,
            image: reader.result,
          }));
        }
        reader.readAsDataURL(file);
        setLogoSelected(event.target.files.length > 0);
      }
    }
  }

  const clearLogo = () => {
    const logoInput = document.getElementById("logoInput");
    if (logoInput) {
      logoInput.value = "";
      setDesignLogo("");
      setOptions((options) => ({
        ...options,
        image: "",
      }));
      setLogoSelected(false);
    }
  };

  function handleLogoSizeChange(event) {
    setLogoSize(event.target.value);
    setOptions((options) => ({
      ...options,
      imageOptions: {
        ...options.imageOptions,
        imageSize: event.target.value,
      },
    }));
  }

  function handleLogoMarginChange(event) {
    setLogoMargin(event.target.value);
    setOptions((options) => ({
      ...options,
      imageOptions: {
        ...options.imageOptions,
        margin: event.target.value,
      },
    }));
  }

  function handleTypeChange(event) {
    setTypeNumber(event.target.value);
    setOptions((options) => ({
      ...options,
      qrOptions: {
        ...options.qrOptions,
        typeNumber: event.target.value,
      },
    }));
  }

  function onSubmit(){
    // console.log(JSON.stringify(options, null, 2));
    if (onChange) onChange(options);
  }

  function resetDesignData(){
    setOptions(defaultOptions);
    setLogoSelected(false);
    setDesignLogo("");
    setLogoMargin("1");
    setLogoSize("0.4");
    setQRColor("#000000");
    setQRBackgroundColor("#ffffff");
    setCornerSquareStyle(null);
    setCornerSquareColor("#000000");
    setCornerDotStyle(null);
    setCornerDotColor("#000000");
    setDotsStyle("square");
    setTypeNumber("0");
    setErrorCorrection();
    setTrasnparentBg(false);
    setImageInput("");
  }

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button variant="secondary">QR Design Options</Button>
      </DialogTrigger>
      <DialogContent className="[&>button]:hidden flex justify-center items-center min-w-full w-full h-full fixed z-50 bg-black/80 p-10 sm:rounded-none border-none sm:border-black/100" onInteractOutside={(e) => { e.preventDefault(); }}>
        <Card className="lg:max-w-[1000px] w-[1000px] lg:max-h-[560px] h-[560px] p-6">
          <DialogHeader>
            <DialogTitle>QR Code Design</DialogTitle>
          </DialogHeader>
          <div className='dialogContent flex mt-4'>
            <ScrollArea className="h-[420px] pr-4 w-[75%] overflow-hidden">
              <Accordion type="single" collapsible className='no-underline'> {/* image options */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="no-underline">Image Options</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid w-full max-w-sm items-center gap-4 mt-1">
                      <div className='flex items-center'>
                        <Label className="text-sm text-muted-foreground font-normal w-[100px]" htmlFor="picture">
                          Insert Logo
                        </Label>
                        <div className="flex gap-2">
                          <Input id="logoInput" disabled={logoSelected} type="file" className="w-[300px]" onChange={handleLogoChange} accept="image/*"/>
                          <Button type="submit" onClick={clearLogo}><Trash2 /></Button>
                        </div>
                      </div>
                      {logoSelected && (
                        <div className='flex gap-2'>
                          <div className="flex auto-row-2 w-full max-w-sm items-center gap-1.5">
                            <Label className="text-sm text-muted-foreground font-normal" htmlFor="picture">Logo Size</Label>
                            <Input className="w-[100px]"
                              id="picture"
                              type="number"
                              min="0.1"
                              max="3"
                              step={0.1}
                              value={designLogoSize}
                              onChange={handleLogoSizeChange}
                              disabled={!logoSelected}
                            />
                          </div>
                          <div className="flex w-full max-w-sm items-center gap-1.5">
                            <Label className="text-sm text-muted-foreground font-normal" htmlFor="picture">Logo Margin</Label>
                            <Input className="w-[100px]"
                              id="form-image-margin"
                              type="number"
                              min="0"
                              max="10"
                              step={1}
                              value={designLogoMargin}
                              onChange={handleLogoMarginChange}
                              disabled={!logoSelected}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible> {/* QR Color */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="no-underline">QR Color</AccordionTrigger>
                  <AccordionContent className="w-full">
                    <div className="flex items-center gap-10 w-full min-w-full">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-sm text-muted-foreground font-normal mt-[5px]" htmlFor="picture">QR Code Color</Label>
                        <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg items-center"
                          value={designQRColor}
                          onChange={(v) => {
                            setQRColor(v);
                            setCornerSquareColor(v);
                            setCornerDotColor(v);
                            setOptions((options) => ({
                              ...options,
                              dotsOptions: {
                                ...options.dotsOptions,
                                color: v,
                              },
                              cornersSquareOptions: {
                                ...options.cornersSquareOptions,
                                color: v,
                              },cornersDotOptions: {
                                ...options.cornersDotOptions,
                                color: v,
                              },
                            }));
                          }}
                        />
                      </div>
                      <div className="flex items-center mt-[5px] ml-[0px]">
                        <Label className="text-sm text-muted-foreground font-normal mr-[5px]" htmlFor="picture">Transparent Background</Label>
                        <Switch className='mt-[2px]'
                          checked={trasnparentBg}
                          onCheckedChange={(v) => {
                            setTrasnparentBg(v);
                            setOptions((options) => ({
                              ...options,
                              backgroundOptions: {
                                ...options.backgroundOptions,
                                color: 'transparent',
                              },
                            }));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        { !trasnparentBg && (
                          <div className='flex items-center'>
                            <Label className="text-sm text-muted-foreground font-normal mt-[5px] mr-[5px]" htmlFor="picture">Background Color</Label>
                            <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg"
                              value={designQRBackgroundColor}
                              onChange={(v) => {
                                setQRBackgroundColor(v);
                                setOptions((options) => ({
                                  ...options,
                                  backgroundOptions: {
                                    ...options.backgroundOptions,
                                    color: v,
                                  },
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible> {/* Dots Options */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="no-underline">Dots Options</AccordionTrigger>
                  <AccordionContent>
                  <div className="grid grid-cols-1 items-center gap-4 mt-1">
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-muted-foreground">Dots Style</p>
                        <Popover open={open2} onOpenChange={setOpen2}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-[150px] justify-start"
                            >
                              {designDotsStyle ? (
                                <>
                                  {designDotsStyle.label}
                                </>
                              ) : (
                                <>{dotShapes[0].label}</>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[180px]" side="right" align="start" style={{ pointerEvents: "auto" }}>
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                  {dotShapes.map((status) => (
                                    <CommandItem
                                      key={status.value}
                                      value={status.value}
                                      onSelect={(value) => {
                                        setDotsStyle(
                                          dotShapes.find((priority) => priority.value === value) ||
                                            null
                                        )
                                        setOptions((options) => ({
                                          ...options,
                                          dotsOptions: {
                                            ...options.dotsOptions,
                                            type: value
                                          },
                                        }));
                                        setOpen(false)
                                      }}
                                    >
                                      <span>{status.label}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    {/* <div className="flex w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="picture">Dots Color</Label>
                      <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg"
                        value={designDotsColor}
                        onChange={(v) => {
                          setDotsColor(v);
                          setOptions((options) => ({
                            ...options,
                            dotsOptions: {
                              ...options.dotsOptions,
                              color: v,
                            },
                          }));
                        }}
                      />
                    </div> */}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible> {/* Corner Square Options */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="no-underline">Corner Square Options</AccordionTrigger>
                  <AccordionContent className="grid grid-cols-1 items-center gap-2">
                    <div className="grid grid-cols-1 items-center gap-4 mt-1">
                      <div className='flex gap-10 w-max'>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground w-[150px]">Corner Square Style</p>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-[150px] justify-start"
                              >
                                {designCornerSquareStyle ? (
                                  <>
                                    {designCornerSquareStyle.label}
                                  </>
                                ) : (
                                  <>{dotShapes[0].label}</>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[180px]" side="right" align="start" style={{ pointerEvents: "auto" }}>
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    {dotShapes.map((status) => (
                                      <CommandItem
                                        key={status.value}
                                        value={status.value}
                                        onSelect={(value) => {
                                          setCornerSquareStyle(
                                            dotShapes.find((priority) => priority.value === value) ||
                                              null
                                          )
                                          setOptions((options) => ({
                                            ...options,
                                            cornersSquareOptions: {
                                              ...options.cornersSquareOptions,
                                              type: value
                                            },
                                          }));
                                          setOpen(false)
                                        }}
                                      >
                                        <span>{status.label}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex w-full max-w-sm items-center gap-1.5">
                          <Label className="text-sm text-muted-foreground font-normal mt-[5px]" htmlFor="picture">Corner Square Color</Label>
                          <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg"
                            value={designCornerSquareColor}
                            onChange={(v) => {
                              setCornerSquareColor(v);
                              setOptions((options) => ({
                                ...options,
                                cornersSquareOptions: {
                                  ...options.cornersSquareOptions,
                                  color: v,
                                },
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-muted-foreground w-[133px]">Corner Dot Style</p>
                          <Popover open={open4} onOpenChange={setOpen4}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-[150px] justify-start"
                              >
                                {designCornerDotStyle ? (
                                  <>
                                    {designCornerDotStyle.label}
                                  </>
                                ) : (
                                  <>{dotShapes[0].label}</>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[180px]" side="right" align="start" style={{ pointerEvents: "auto" }}>
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    {dotShapes.map((status) => (
                                      <CommandItem
                                        key={status.value}
                                        value={status.value}
                                        onSelect={(value) => {
                                          setCornerDotStyle(
                                            dotShapes.find((priority) => priority.value === value) ||
                                              null
                                          )
                                          setOptions((options) => ({
                                            ...options,
                                            cornersDotOptions: {
                                              ...options.cornersDotOptions,
                                              type: value
                                            },
                                          }));
                                          setOpen(false)
                                        }}
                                      >
                                        <span>{status.label}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex w-full max-w-sm items-center gap-2">
                          <Label className="text-sm text-muted-foreground font-normal mt-[6px]" htmlFor="picture">Corner Square Dot Color</Label>
                          <ColorPicker name="qrColor" className="mt-2 w-8 h-8 rounded-lg"
                            value={designCornerDotColor}
                            onChange={(v) => {
                              setCornerDotColor(v);
                              setOptions((options) => ({
                                ...options,
                                cornersDotOptions: {
                                  ...options.cornersDotOptions,
                                  color: v,
                                },
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible> {/* QR Config */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="no-underline">QR Config</AccordionTrigger>
                  <AccordionContent className="grid grid-cols-1 items-center gap-2">
                    {/* <div className="grid grid-cols-4 items-center gap-0 mt-1">
                      <Label className="text-sm text-muted-foreground font-normal" htmlFor="picture">Type Number</Label>
                      <Input id="typeNumber" type="number" min="0" max="40" step={1}
                        value={designTypeNumber}
                        onChange={handleTypeChange}
                      />
                    </div> */}
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-muted-foreground">Error Correction Level</p>
                      <Popover open={open3} onOpenChange={setOpen3}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-[150px] justify-start"
                          >
                            {designErrorCorrection ? (
                              <>
                                {designErrorCorrection.label}
                              </>
                            ) : (
                              <>{errorCorrectionLevels[2].label}</>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[180px]" side="right" align="start" style={{ pointerEvents: "auto" }}>
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {errorCorrectionLevels.map((status) => (
                                  <CommandItem
                                    key={status.value}
                                    value={status.value}
                                    onSelect={(value) => {
                                      setErrorCorrection(
                                        errorCorrectionLevels.find((priority) => priority.value === value) ||
                                          null
                                      )
                                      setOptions((options) => ({
                                        ...options,
                                        qrOptions: {
                                          ...options.qrOptions,
                                          errorCorrectionLevel: value
                                        },
                                      }));
                                      setLogoSize(status.imageSize);
                                      setOptions((options) => ({
                                        ...options,
                                        imageOptions: {
                                          ...options.imageOptions,
                                          imageSize: status.imageSize,
                                        },
                                      }));
                                      setOpen(false)
                                    }}
                                  >
                                    <span>{status.label}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
            <Card className="flex flex-col items-center lg:max-w-[320px] lg:max-h-[420px] w-[320px] p-8 pt-4 ">
              {showAlert ?
                <Alert variant="destructive" className='flex w-[280px] top-0 mb-4 p-2 content-center'>
                  <AlertDescription className='text-xs'>
                    That QR Code might not be scannable. Scan it to ensure it can be easily decoded.
                  </AlertDescription>
                </Alert>
              : <div className='p-2 mt-[50px]'></div>}
              <CardContent>
                <ClientQR options={options} />
              </CardContent>
              <CardFooter className="flex justify-center flex-col gap-2">
                <CardTitle className="text-md">Preview</CardTitle>
              </CardFooter>
            </Card>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="float-left" onClick={ resetDesignData }>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" onClick={onSubmit}>Save</Button>
            </DialogClose>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
});

DesignOptions.displayName = 'DesignOptions';

export { DesignOptions };
