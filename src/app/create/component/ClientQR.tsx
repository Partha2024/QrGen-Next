"use client"
import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import QRCodeStyling, { Options, FileExtension } from "qr-code-styling";

export default function ClientQR({options}) {
  const [fileExt, setFileExt] = useState<FileExtension>("png");
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
  }, [])

  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode?.update(options);
  }, [qrCode, options]);

  // const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setOptions(options => ({
  //     ...options,
  //     data: event.target.value
  //   }));
  // };

  const onExtensionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFileExt(event.target.value as FileExtension);
  };

  const onDownloadClick = () => {
    if (!qrCode) return;
    qrCode.download({
      extension: fileExt
    });
  };

  return (
    <>
      <div id="qrImageDiv" ref={ref}/>
      {/* <div className="flex flex-col items-center gap-2">
        <input value={options.data} onChange={onDataChange} className={styles.inputBox}/>
        <select onChange={onExtensionChange} value={fileExt}> 
          <option value="svg">SVG</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WEBP</option>
        </select>
        <button onClick={onDownloadClick}>Download</button>
      </div> */}
    </>
  );
}