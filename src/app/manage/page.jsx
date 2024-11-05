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
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      const formattedData = result.map((qr) => {
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
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (uniqueId) => {
    toast("Success! - "+uniqueId, {
      description: "QR Code Edited Successfully!!",
    })
  }

  const handleDelete = async (uniqueId) => {
    
    try {
      const response = await fetch(`/api/deleteQr?id=${encodeURIComponent(uniqueId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete the QR code");
      }else{
        toast("Success", {
          description: "QR Code Deleted Successfully!!",
        })
      }
      await fetchData();
    } catch (error) {
      console.error("Error deleting QR code:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="h-full">
      {loading ? (
        <LoaderCircle className="mx-auto mt-8" />
      ) : (
        <DataTable columns={columns(handleDelete, handleEdit)} data={data} />
      )}
    </div>
  );
}

export default Manage;
