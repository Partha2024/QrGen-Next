// "use client";
// import React, { useEffect, useRef, useState, ChangeEvent } from "react";
// import QRCodeStyling, { Options, FileExtension } from "qr-code-styling";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// const extensions = [
//   {
//     value: "png",
//     label: "PNG",
//   },
//   {
//     value: "jpeg",
//     label: "JPEG",
//   },
//   {
//     value: "webp",
//     label: "WEBP",
//   },
//   {
//     value: "svg",
//     label: "SVG",
//   },
// ];

// export default function ClientQR({ options, qrCodeName }) {
//   const [qrCode, setQrCode] = useState<QRCodeStyling>();
//   const ref = useRef<HTMLDivElement>(null);
//   const [open, setOpen] = React.useState(false);
//   const [value, setValue] = React.useState<FileExtension>("png");

//   useEffect(() => {
//     setQrCode(new QRCodeStyling(options));
//   }, []);

//   useEffect(() => {
//     if (ref.current) {
//       qrCode?.append(ref.current);
//     }
//   }, [qrCode, ref]);

//   useEffect(() => {
//     if (!qrCode) return;
//     qrCode?.update(options);
//   }, [qrCode, options]);

//   const onDownloadClick = () => {
//     if (!qrCode) return;
//     qrCode.download({
//       name: qrCodeName,
//       extension: value,
//     });
//   };

//   return (
//     <>
//       <div id="qrImageDiv" className="max-w[220px] max-h-[220px]" ref={ref} />
//       <div className="flex flex-col items-center gap-2 mt-10">
//         <Popover open={open} onOpenChange={setOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={open}
//               className="w-[100px] justify-between">
//               {value
//                 ? extensions.find((framework) => framework.value === value)
//                     ?.label
//                 : "Select framework..."}
//               <ChevronsUpDown className="opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-[100px] p-0">
//             <Command>
//               <CommandList>
//                 <CommandEmpty>No framework found.</CommandEmpty>
//                 <CommandGroup>
//                   {extensions.map((framework) => (
//                     <CommandItem
//                       key={framework.value}
//                       value={framework.value}
//                       onSelect={(currentValue) => {
//                         setValue(currentValue === value ? "" : currentValue);
//                         setOpen(false);
//                       }}>
//                       {framework.label}
//                       <Check
//                         className={cn(
//                           "ml-auto",
//                           value === framework.value
//                             ? "opacity-100"
//                             : "opacity-0"
//                         )}
//                       />
//                     </CommandItem>
//                   ))}
//                 </CommandGroup>
//               </CommandList>
//             </Command>
//           </PopoverContent>
//         </Popover>
//         <Button onClick={onDownloadClick}>Download</Button>
//       </div>
//     </>
//   );
// }



"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const extensions = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WEBP" },
  { value: "svg", label: "SVG" },
];

export default function ClientQR({ options, qrCodeName }) {
  const [qrCode, setQrCode] = useState(null);
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("png");

  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
  }, [options]);

  useEffect(() => {
    if (ref.current && qrCode) {
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  useEffect(() => {
    if (qrCode) {
      qrCode.update(options);
    }
  }, [qrCode, options]);

  const onDownloadClick = () => {
    if (!qrCode) return;
    qrCode.download({ name: qrCodeName, extension: value });
  };

  return (
    <>
      <div id="qrImageDiv" className="max-w-[220px] max-h-[220px]" ref={ref} />
      <div className="flex flex-col items-center gap-2 mt-10">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[100px] justify-between"
            >
              {extensions.find((ext) => ext.value === value)?.label || "Select format"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[100px] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No formats found.</CommandEmpty>
                <CommandGroup>
                  {extensions.map((ext) => (
                    <CommandItem
                      key={ext.value}
                      value={ext.value}
                      onSelect={() => {
                        setValue(ext.value);
                        setOpen(false);
                      }}
                    >
                      {ext.label}
                      <Check className={cn("ml-auto", value === ext.value ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button onClick={onDownloadClick}>Download</Button>
      </div>
    </>
  );
}
