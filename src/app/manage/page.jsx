"use client";

import React, { useEffect, useState } from "react";
import "./style.css";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

function formatDate(date) {
  if (isNaN(date)) {
    return "Invalid Date";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function Manage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("./api/getQrData");
      if (!response.ok) {
        toast.error("Network Response Was Not Ok", {
          style: {
            color: '#e60000',
            background: '#fff0f0',
            borderColor: '#ffe0e1',
          },
        })
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      const resultArray = Object.values(result);
      const formattedData = resultArray.map((qr) => {
        const createdAtDate = new Date(qr.createdAt);
        const lastModifiedDate = new Date(qr.updatedAt);
        return {
          id: qr.unique_id,
          qrCodeImage: qr.qr_image || "https://www.qrstuff.com/images/sample.png",
          name: qr.qr_code_name,
          experience: qr.qr_experience,
          createdAt: formatDate(createdAtDate),
          lastModified: formatDate(lastModifiedDate),
        };
      });
      console.log("formattedData", Object.values(formattedData).find((qr) => qr.id === "1741110992492"));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (uniqueId) => {
    window.location.href = "/edit?uid=" + uniqueId;
  }

  // const [color, setColor] = useState("#171717");
  // const [background, setBackground] = useState("#fff");
  // const [borderColor, setBorderColor] = useState("#ededed");

  const handleDelete = async (uniqueId) => {
    let myPromise = new Promise(async function(resolve, reject) {
      try {
        const response = await fetch(`/api/deleteQr?id=${encodeURIComponent(uniqueId)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          reject();
          throw new Error("Failed to delete the QR code");
        }else{
          resolve();
          const updatedQrData = Object.fromEntries(
            Object.entries(data).filter(([key, qr]) => qr.id !== uniqueId)
          );
          setData()
          setData(Object.values(updatedQrData));
          // setTimeout(() => {
          //   window.location.reload(); // temporary fix of inaccessible datatable after deleting QR Code
          // }, 1000)
        }
      } catch (error) {
        console.error("Error deleting QR code:", error);
      }
    });
    toast.promise(myPromise, {
      loading:  "Deleting QR Code...",
      // success: "QR Code Deleted Successfully" ,
      success: () => {
        // setColor("#008a2e");
        // setBackground("#ecfdf3");
        // setBorderColor("#bffcd9")
        return "QR Code Deleted Successfully"
      },
      // error: "Failed To Delete QR Code",
      error: () => {
        // setColor("#e60000");
        // setBackground("#fff0f0");
        // setBorderColor("#ffe0e1");
        return "Failed To Delete QR Code"
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="h-full">
      {loading ? (
        <LoaderCircle className="loadingSpinner mx-auto" />
      ) : (
        <DataTable columns={columns(handleDelete, handleEdit)} data={data} />
      )}
    </div>
  );
}

export default Manage;
